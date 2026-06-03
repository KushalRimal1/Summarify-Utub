# 🎬 Summarify-Utube

> **An intelligent YouTube video summarizer and Q&A system powered by AI**

Transform any YouTube video into comprehensive summaries and interact with video content using natural language. Ask questions via text or voice, and get intelligent answers backed by a knowledge graph.

![YouTube Summarizer](https://img.shields.io/badge/YouTube-Summarizer-red?style=for-the-badge&logo=youtube)
![AI Powered](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)

## ✨ Key Features

### 🎯 Core Capabilities

- **📝 Intelligent Video Summarization**
  - Extract and analyze YouTube video transcripts automatically
  - Generate structured summaries with key points, takeaways, and topics
  - Customizable summary length and style (concise, normal, explanatory)
  - Multi-language support for summaries and content

### 🎤 Speech & Voice Features

- **🎙️ Voice Input for Questions**

  - Click the microphone button to ask questions using your voice
  - Real-time speech-to-text transcription powered by Groq Whisper
  - Supports multiple languages for speech recognition
  - Seamless conversion from speech to text before processing

- **🔊 Text-to-Speech (TTS)**
  - Listen to answers and summaries with natural-sounding voices
  - Multi-language voice output support

### 💬 Intelligent Q&A System

- **❓ Natural Language Question Answering**

  - Ask questions about video content using natural language
  - Get context-aware answers based on video transcripts
  - Answers powered by knowledge graph relationships and AI reasoning

- **🗣️ Multiple Input Methods**

  - Type your questions directly
  - Use voice input with speech recognition
  - Switch between input methods seamlessly

- **📚 Q&A History Management**
  - View your recent question-answer pairs
  - Store last 3 Q&A interactions in browser local storage
  - Quick access to previous conversations

### 🕸️ Knowledge Graph Integration

- **🔗 Neo4j Knowledge Graph**
  - Automatically generates knowledge graphs from video content
  - Extracts entities, relationships, and concepts
  - Enhances Q&A accuracy with graph-based context
  - Visual representation of video content relationships

### 🎨 User Experience

- **🌓 Dark/Light Mode**

  - Toggle between dark and light themes
  - Smooth theme transitions
  - Eye-friendly design for extended use

- **📱 Responsive Design**
  - Modern UI built with Material-UI and Tailwind CSS
  - Fully responsive across desktop, tablet, and mobile devices
  - Intuitive and user-friendly interface

### 🌍 Internationalization

- **🌐 Multi-Language Support**
  - Support for multiple languages in summaries
  - Questions and answers in your preferred language
  - Speech recognition in various languages

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - Backend runtime environment
- **Node.js 18+** - Frontend runtime environment
- **Neo4j Database** - Graph database for knowledge storage
- **Groq API Key** - Required for AI processing ([Get your API key](https://console.groq.com/))

### 📦 Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Summarify-Utube.git
cd Summarify-Utube
```

#### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and fill in your credentials
cp .env.example .env
# Edit .env with your API keys and Neo4j credentials
```

**Environment Variables Required:**

- `GROQ_API_KEY` - Your Groq API key
- `NEO4J_URI` - Neo4j database URI (e.g., `bolt://localhost:7687`)
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

📖 **See [ENV_SETUP.md](backend/ENV_SETUP.md) for detailed configuration instructions**

```bash
# Start the backend server
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 4. Neo4j Database Setup

1. **Install Neo4j**

   - Download from [neo4j.com](https://neo4j.com/download/)
   - Or use Neo4j Desktop or Docker

2. **Start Neo4j**

   ```bash
   # Using Docker
   docker run -d -p 7474:7474 -p 7687:7687 neo4j:latest
   ```

3. **Configure Connection**
   - Default URI: `bolt://localhost:7687`
   - Default username: `neo4j`
   - Set your password on first login
   - Update the `.env` file with your credentials

## 📖 Usage Guide

### Basic Workflow

1. **Launch the Application**

   - Open `http://localhost:5173` in your browser
   - Ensure both backend and frontend servers are running

2. **Generate a Video Summary**

   - Paste a YouTube video URL in the input field
   - Select your preferred language for the summary
   - Choose summary length (short, medium, long)
   - Select summary style (concise, normal, explanatory)
   - Click **"Generate Summary"** button
   - Wait for the AI to process the video transcript

3. **Ask Questions About the Video**

   **Using Text Input:**

   - Type your question in the question input field
   - Press Enter or click the submit button
   - Get instant AI-powered answers based on video content

   **Using Voice Input:**

   - Click the 🎤 **microphone button** next to the question input
   - Grant microphone permissions when prompted
   - Speak your question clearly
   - Click the stop button when finished
   - Your speech will be automatically transcribed to text
   - The question will be processed and answered

4. **View Q&A History**

   - Click the history icon to view your recent questions and answers
   - Access your last 3 Q&A pairs
   - Each entry is stored in browser local storage

5. **Toggle Theme**
   - Click the theme toggle button (🌙/☀️) to switch between dark and light modes
   - Your preference is saved automatically

### 💡 Usage Tips

- **For Best Results:**

  - Use videos with clear transcripts (videos with captions work best)
  - Ask specific questions about video content
  - Speak clearly when using voice input
  - Wait for summary generation before asking questions

- **Supported Features:**
  - Multiple languages for both summaries and questions
  - Voice input in various languages
  - Text-to-speech for answers (when available)
  - Responsive design works on all devices

## 🏗️ System Architecture

### Technology Stack

**Frontend:**

- ⚛️ **React 18** - Modern UI framework
- ⚡ **Vite** - Fast build tool and dev server
- 🎨 **Material-UI (MUI)** - Component library
- 🎭 **Tailwind CSS** - Utility-first styling
- 📡 **Axios** - HTTP client for API communication

**Backend:**

- 🐍 **Python 3.8+** - Programming language
- 🚀 **FastAPI** - Modern async web framework
- ⚡ **Uvicorn** - ASGI server
- 📋 **Pydantic** - Data validation

**Database:**

- 🕸️ **Neo4j** - Graph database for knowledge storage
- 📊 **Cypher** - Graph query language

**AI & ML Services:**

- 🤖 **Groq API** - LLM inference (Llama models)
- 🎤 **Groq Whisper** - Speech-to-text transcription
- 🔊 **Google TTS** - Text-to-speech conversion

**Integrations:**

- 📺 **YouTube Transcript API** - Video transcript extraction
- 📡 **YouTube oEmbed API** - Video metadata fetching

### 🔄 How It Works

1. **Video Processing Flow:**

   ```
   YouTube URL → Extract Video ID → Fetch Transcript → Generate Knowledge Graph → Create Summary
   ```

2. **Question Answering Flow:**

   ```
   Question (Text/Voice) → Speech-to-Text (if voice) → Knowledge Graph Query → AI Reasoning → Answer
   ```

3. **Knowledge Graph Creation:**

   - Analyzes video transcript using AI
   - Extracts entities (people, places, concepts)
   - Identifies relationships between entities
   - Stores in Neo4j graph database
   - Enhances Q&A with graph context

4. **Speech Processing:**
   - Captures audio from microphone
   - Converts to base64 format
   - Sends to backend for transcription
   - Uses Groq Whisper for speech-to-text
   - Supports multiple languages

## 🎯 Key Features in Detail

### 🎤 Speech Recognition

- **Real-time Transcription:** Convert speech to text instantly
- **Multi-language Support:** Recognize speech in various languages
- **Browser-based Recording:** Uses MediaRecorder API
- **Seamless Integration:** Automatically populates question input

### 💬 Intelligent Q&A System

- **Context-Aware Answers:** Uses full transcript + knowledge graph
- **Natural Language Processing:** Understands complex questions
- **Multi-language Responses:** Answers in your preferred language
- **Graph-Enhanced Reasoning:** Leverages entity relationships for better answers

### 🕸️ Knowledge Graph

- **Automatic Generation:** Created automatically from video content
- **Entity Extraction:** Identifies key people, places, and concepts
- **Relationship Mapping:** Connects related entities
- **Persistent Storage:** Stored in Neo4j for fast retrieval

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

   ```bash
   # Click Fork button on GitHub
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make your changes**

   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Commit your changes**

   ```bash
   git commit -m "Add: Description of your feature"
   ```

5. **Push to the branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Groq** for providing fast AI inference APIs
- **Neo4j** for graph database technology
- **Material-UI** for the component library
- **YouTube** for video content access

## 📧 Support

If you encounter any issues or have questions:

- 📝 Open an [Issue](https://github.com/yourusername/Summarify-Utube/issues)
- 💬 Start a [Discussion](https://github.com/yourusername/Summarify-Utube/discussions)
- 📚 Check the [Documentation](backend/ENV_SETUP.md)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Your Name]

</div>
