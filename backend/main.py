from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
import re
import os
import base64
import tempfile
import json
from dotenv import load_dotenv
from groq import Groq
import httpx
from typing import Optional, List, Dict
import ssl
from neo4j import GraphDatabase
from urllib3.util import ssl_
from gtts import gTTS

load_dotenv()

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

@app.get("/")
async def hello():
    return {
        "message": "Hello from VidInsights.ai API!",
        "status": "online",
        "version": "1.0.0"
    }

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Groq model configuration - can be overridden via environment variable
# NOTE: llama-3.3-70b-specdec was deprecated on March 24, 2025
# Recommended alternatives: llama-3.1-70b-versatile, llama-3.3-70b-versatile, llama-3.1-8b-instant
# Or: deepseek-r1-distill-llama-70b, deepseek-r1-distill-qwen-32b (for reasoning tasks)
# Check https://console.groq.com/docs/models for current available models
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # Default to stable versatile model

# Neo4j setup (optional)
neo4j_uri = os.getenv("NEO4J_URI")
neo4j_user = os.getenv("NEO4J_USERNAME")  
neo4j_password = os.getenv("NEO4J_PASSWORD")

# Validate Neo4j credentials
if not all([neo4j_uri, neo4j_user, neo4j_password]):
    raise ValueError("Missing Neo4j credentials. Please check your .env file.")

try:
    # Initialize Neo4j driver with proper SSL configuration
    neo4j_driver = GraphDatabase.driver(
        neo4j_uri,
        auth=(neo4j_user, neo4j_password)
    )
    
    # Test connection
    with neo4j_driver.session() as session:
        result = session.run("RETURN 1")
        result.single()  # Verify we can actually execute a query
    print("Successfully connected to Neo4j database")
    
except Exception as e:
    print(f"Failed to connect to Neo4j: {str(e)}")
    raise ValueError(f"Neo4j connection failed: {str(e)}")

def get_neo4j_driver():
    return neo4j_driver

class VideoRequest(BaseModel):
    video_url: str
    language: str
    word_count: int
    style: str

class QuestionRequest(BaseModel):
    video_url: str
    question: str
    language: str
    question_type: str = "text"  # "text" or "speech"

class SpeechToTextRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data
    language: str

class VideoResponse(BaseModel):
    success: bool
    summary: str
    message: Optional[str] = None
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    tags: Optional[List[str]] = None
    key_takeaway: Optional[str] = None
    key_points: Optional[List[str]] = None
    how_it_started: Optional[str] = None
    top_topics: Optional[List[Dict[str, str]]] = None  # List of {topic, timestamp, description}
    new_things: Optional[List[str]] = None

class QuestionResponse(BaseModel):
    success: bool
    answer: str
    message: Optional[str] = None

class TextFormatter:
    def format_transcript(self, transcript):
        return " ".join([entry["text"] for entry in transcript])

def extract_video_id(url: str) -> str:
    video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
    if not video_id_match:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    return video_id_match.group(1)

def create_knowledge_graph(video_id: str, transcript_text: str):
    try:
        with neo4j_driver.session() as session:
            # First, test the connection
            session.run("RETURN 1")
            
            # check video already exists in knowledge graph
            result = session.run("""
                MATCH (v:Video {video_id: $video_id}) 
                RETURN v LIMIT 1
            """, video_id=video_id)
            
            if result.single():
                print(f"Video with ID '{video_id}' already exists. Aborting operation.")
                return  # Stop function if video already exists

            
            # Create video node
            session.run("""
                CREATE (v:Video {video_id: $video_id, transcript: $transcript})
            """, video_id=video_id, transcript=transcript_text)
            
            # Generate entities and relationships using Groq
            prompt = f"""
            Analyze this video transcript and identify key entities (people, places, concepts, events) and their relationships.
            Format the output as a list of triples (entity1, relationship, entity2).
            Keep it focused on the most important relationships.
            
            Transcript:
            {transcript_text}
            
            Output only the triples in this format (maximum 10 relationships):
            entity1|relationship|entity2
            """
            
            response = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                temperature=0.3,
            )
            
            triples = response.choices[0].message.content.strip().split('\n')
            
            # Create nodes and relationships in Neo4j
            for triple in triples:
                if '|' not in triple:
                    continue
                try:
                    entity1, relationship, entity2 = triple.split('|')
                    session.run("""
                        MATCH (v:Video {video_id: $video_id})
                        MERGE (e1:Entity {name: $entity1})
                        MERGE (e2:Entity {name: $entity2})
                        MERGE (e1)-[r:RELATES_TO {type: $relationship}]->(e2)
                        MERGE (v)-[:HAS_ENTITY]->(e1)
                        MERGE (v)-[:HAS_ENTITY]->(e2)
                    """, 
                    video_id=video_id,
                    entity1=entity1.strip(),
                    entity2=entity2.strip(),
                    relationship=relationship.strip()
                    )
                except Exception as e:
                    print(f"Error creating relationship: {str(e)}")
                    continue
                    
    except Exception as e:
        print(f"Error in create_knowledge_graph: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create knowledge graph: {str(e)}"
        )

def enforce_language(text: str, target_language: str) -> str:
    """Ensure the text is in the specified language using appropriate grammar and script"""
    language_prompts = {
        "english": "Translate this to English if it's not already in English: ",
        "hindi": "Translate this to Hindi (हिंदी) using Devanagari script: ",
        "marathi": "Translate this to Marathi (मराठी) using Marathi script. Ensure it's proper Marathi, not Hindi: ",
        "gujarati": "Translate this to Gujarati (ગુજરાતી) using Gujarati script: ",
        "bengali": "Translate this to Bengali (বাংলা) using Bengali script: ",
        "kannada": "Translate this to Kannada (ಕನ್ನಡ) using Kannada script: "
    }
    
    prompt = f"""
    {language_prompts.get(target_language.lower(), "Translate to English: ")}
    
    Text: {text}
    
    Important: If the target language is Marathi, ensure it's proper Marathi language and not Hindi.
    Use appropriate grammar, vocabulary, and expressions specific to the target language.
    Do not add any disclaimer or translation notes, Also, Dont mention anything about nodes.
    """
    
    response = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=GROQ_MODEL,
        temperature=0.3,
    )
    
    return response.choices[0].message.content.strip()

def generate_structured_summary(video_id: str, transcript_text: str, transcript_data: List[Dict], style: str, word_count: int, language: str = "english") -> Dict:
    """Generate a comprehensive structured summary with all required fields"""
    
    # Create timestamp map for transcript
    timestamp_map = {}
    for entry in transcript_data:
        start_time = int(entry.get("start", 0))
        minutes = start_time // 60
        seconds = start_time % 60
        timestamp_str = f"{minutes:02d}:{seconds:02d}"
        if timestamp_str not in timestamp_map:
            timestamp_map[timestamp_str] = entry["text"]
    
    # Generate comprehensive structured summary
    structured_prompt = f"""Analyze this video transcript and provide a comprehensive structured summary in JSON format.

Video Transcript:
{transcript_text}

Please provide the following information in JSON format:
1. **key_takeaway**: A one-sentence key takeaway from the video (max 200 words)
2. **key_points**: List of 5-7 key points discussed (each point should be 1-2 sentences)
3. **how_it_started**: How the video started - what was the opening/introduction (2-3 sentences)
4. **top_topics**: List of exactly 10 important topics discussed, each with:
   - topic: The topic name
   - timestamp: Approximate time when this topic was discussed (format: MM:SS)
   - description: Brief description of what was discussed about this topic (1-2 sentences)
5. **tags**: List of 8-12 relevant tags/keywords (single words or short phrases)
6. **new_things**: List of 3-5 new or interesting things mentioned in the video (each 1 sentence)
7. **summary**: A comprehensive {style} summary of approximately {word_count} words covering the entire video

Important:
- For timestamps, estimate based on the content flow (divide transcript length proportionally)
- Make the summary {style} in nature
- Ensure all fields are filled
- Return ONLY valid JSON, no markdown formatting or extra text

JSON Format:
{{
  "key_takeaway": "...",
  "key_points": ["...", "..."],
  "how_it_started": "...",
  "top_topics": [
    {{"topic": "...", "timestamp": "MM:SS", "description": "..."}},
    ...
  ],
  "tags": ["...", "..."],
  "new_things": ["...", "..."],
  "summary": "..."
}}
"""
    
    try:
        # Try with JSON response format first
        summary_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": structured_prompt}],
            model=GROQ_MODEL,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
    except Exception as e:
        # Fallback if JSON format is not supported
        print(f"JSON format not supported, trying without: {str(e)}")
        summary_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": structured_prompt}],
            model=GROQ_MODEL,
            temperature=0.7
        )
    
    try:
        content = summary_response.choices[0].message.content
        structured_data = json.loads(content)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        content = summary_response.choices[0].message.content
        # Try to extract JSON from markdown code blocks
        import re
        json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
        if json_match:
            try:
                structured_data = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                structured_data = None
        else:
            # Try to find JSON object in the content
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    structured_data = json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    structured_data = None
        
        # Last resort: create basic structure
        if not structured_data:
            structured_data = {
                "key_takeaway": content[:200] if len(content) > 200 else content,
                "key_points": [],
                "how_it_started": "The video begins with an introduction.",
                "top_topics": [],
                "tags": [],
                "new_things": [],
                "summary": content
            }
    
    # Enforce language for all text fields
    if language.lower() != "english":
        if structured_data.get("key_takeaway"):
            structured_data["key_takeaway"] = enforce_language(structured_data["key_takeaway"], language)
        if structured_data.get("key_points"):
            structured_data["key_points"] = [enforce_language(point, language) for point in structured_data["key_points"]]
        if structured_data.get("how_it_started"):
            structured_data["how_it_started"] = enforce_language(structured_data["how_it_started"], language)
        if structured_data.get("top_topics"):
            for topic in structured_data["top_topics"]:
                topic["topic"] = enforce_language(topic.get("topic", ""), language)
                topic["description"] = enforce_language(topic.get("description", ""), language)
        if structured_data.get("summary"):
            structured_data["summary"] = enforce_language(structured_data["summary"], language)
        if structured_data.get("new_things"):
            structured_data["new_things"] = [enforce_language(thing, language) for thing in structured_data["new_things"]]
    
    return structured_data

def generate_graph_based_summary(video_id: str, style: str, word_count: int, language: str = "english") -> str:
    with neo4j_driver.session() as session:
        # Get the transcript and key entities
        result = session.run("""
            MATCH (v:Video {video_id: $video_id})
            OPTIONAL MATCH (v)-[:HAS_ENTITY]->(e)
            WITH v, collect(DISTINCT e.name) as entities
            RETURN v.transcript as transcript, entities
        """, video_id=video_id)
        
        data = result.single()
        if not data:
            raise HTTPException(status_code=404, detail="Video not found in knowledge graph")
        
        transcript = data["transcript"]
        entities = data["entities"]
        
        # Get key relationships
        relationships = session.run("""
            MATCH (v:Video {video_id: $video_id})-[:HAS_ENTITY]->(e1)-[r:RELATES_TO]->(e2)
            RETURN e1.name as from, r.type as relationship, e2.name as to
        """, video_id=video_id)
        
        relationships_text = "\n".join([
            f"- {rel['from']} {rel['relationship']} {rel['to']}"
            for rel in relationships
        ])

        # Generate summary first
        summary_prompt = f"""
        Generate a {style} summary of approximately {word_count} words for this video.
        Use the knowledge graph information to structure the summary.
        
        Key entities: {', '.join(entities)}
        
        Key relationships:
        {relationships_text}
        
        Full transcript:
        {transcript}
        
        Focus on the main topics and their relationships, ensuring the summary is {style} in nature.
        """
        
        summary_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": summary_prompt}],
            model=GROQ_MODEL,
            temperature=0.7,
        )
        
        summary = summary_response.choices[0].message.content.strip()
        
        # Enforce the target language
        if language.lower() != "english":
            summary = enforce_language(summary, language)
        
        return summary

def answer_question_with_graph(video_id: str, question: str, language: str = "english") -> str:
    with neo4j_driver.session() as session:
        # Get relevant entities and relationships based on the question
        result = session.run("""
            MATCH (v:Video {video_id: $video_id})
            OPTIONAL MATCH (v)-[:HAS_ENTITY]->(e1)-[r:RELATES_TO]->(e2)
            WITH v, collect(DISTINCT {from: e1.name, rel: r.type, to: e2.name}) as relationships
            RETURN v.transcript as transcript, relationships
        """, video_id=video_id)
        
        data = result.single()
        if not data:
            raise HTTPException(status_code=404, detail="Video not found in knowledge graph")
        
        transcript = data["transcript"]
        relationships = data["relationships"]
        
        relationships_text = "\n".join([
            f"- {rel['from']} {rel['rel']} {rel['to']}"
            for rel in relationships
        ])

        # Generate answer first in English
        answer_prompt = f"""
        Answer this question based on the video content and knowledge graph: {question}
        
        Use these relationships from the knowledge graph to provide context:
        {relationships_text}
        
        Full transcript:
        {transcript}
        
        Provide a clear and concise answer, using the knowledge graph relationships to support your response.
        """
        
        answer_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": answer_prompt}],
            model=GROQ_MODEL,
            temperature=0.5,
        )
        
        answer = answer_response.choices[0].message.content.strip()
        
        # Enforce the target language
        if language.lower() != "english":
            answer = enforce_language(answer, language)
        
        return answer

@app.post("/speech-to-text")
async def speech_to_text(request: SpeechToTextRequest):
    try:
        # Decode base64 audio data
        audio_bytes = base64.b64decode(request.audio_data.split(',')[1] if ',' in request.audio_data else request.audio_data)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.m4a', delete=False) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name
        
        try:
            # Transcribe using Groq's API
            with open(temp_audio_path, "rb") as audio_file:
                transcription = groq_client.audio.transcriptions.create(
                    file=(temp_audio_path, audio_file.read()),
                    model="distil-whisper-large-v3-en",
                    response_format="verbose_json",
                )
            
            # Clean up temp file
            os.unlink(temp_audio_path)
            
            # If language is not English, translate the transcription
            text = transcription.text
            if request.language.lower() != "english":
                text = enforce_language(text, request.language)
            
            return {
                "success": True,
                "text": text.strip()
            }
        except Exception as e:
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")

def get_video_title(video_id: str) -> str:
    """Fetch video title from YouTube using oEmbed API"""
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = httpx.get(oembed_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("title", "YouTube Video")
    except Exception as e:
        print(f"Error fetching video title: {str(e)}")
    return "YouTube Video"

@app.post("/process-video", response_model=VideoResponse)
async def process_video(request: VideoRequest):
    try:
        video_id = extract_video_id(request.video_url)
        try:
            yt_api = YouTubeTranscriptApi()
            transcript_data = yt_api.fetch(video_id).to_raw_data()
            formatter = TextFormatter()
            transcript_text = formatter.format_transcript(transcript_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not fetch video transcript: {str(e)}")
        
        try:
            # Get video title
            video_title = get_video_title(video_id)
            
            # Create knowledge graph
            create_knowledge_graph(video_id, transcript_text)
            
            # Generate structured summary
            structured_data = generate_structured_summary(
                video_id=video_id,
                transcript_text=transcript_text,
                transcript_data=transcript_data,
                style=request.style,
                word_count=request.word_count,
                language=request.language
            )
            
            return VideoResponse(
                success=True,
                video_id=video_id,
                video_title=video_title,
                summary=structured_data.get("summary", ""),
                tags=structured_data.get("tags", []),
                key_takeaway=structured_data.get("key_takeaway", ""),
                key_points=structured_data.get("key_points", []),
                how_it_started=structured_data.get("how_it_started", ""),
                top_topics=structured_data.get("top_topics", []),
                new_things=structured_data.get("new_things", []),
                message="Video processed successfully"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        video_id = extract_video_id(request.video_url)
        
        if request.question_type == "speech":
            # Transcribe speech to text
            speech_to_text_response = await speech_to_text(SpeechToTextRequest(audio_data=request.question, language=request.language))
            question = speech_to_text_response["text"]
        else:
            question = request.question
        
        try:
            # Use knowledge graph for Q&A with language support
            answer = answer_question_with_graph(
                video_id=video_id,
                question=question,
                language=request.language  
            )
            
            return QuestionResponse(
                success=True,
                answer=answer,
                message="Question answered successfully"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define a Pydantic model for the request body
class TextToSpeechRequest(BaseModel):
    text: str
    lang: str

# test to speech route
@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    try:
        # Create a gTTS object
        tts = gTTS(text=request.text, lang=request.lang, slow=False)
        
        # Save the audio to a temporary file
        audio_file = "temp_audio.mp3"
        tts.save(audio_file)
        
        # Read the audio file and encode it to base64
        with open(audio_file, "rb") as audio:
            audio_base64 = base64.b64encode(audio.read()).decode('utf-8')
        
        # Clean up the temporary file
        os.remove(audio_file)
        
        return {"audioContent": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
