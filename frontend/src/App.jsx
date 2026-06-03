import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Select, MenuItem, Typography, IconButton, Paper, Slider, Dialog, DialogTitle, DialogContent, Drawer, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import config from './config';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { themeConfig } from './theme';

const getTheme = (mode) => {
  const colors = themeConfig.colors[mode];
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.accent.primary, // Reddish accent
      },
      secondary: {
        main: colors.accent.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
    },
    typography: {
      fontFamily: themeConfig.typography.fontFamily,
      h4: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: isDark ? 'blur(12px)' : 'none',
            borderRadius: themeConfig.borderRadius.large,
            border: `1px solid ${colors.border.default}`,
            boxSizing: 'border-box',
            backgroundColor: colors.paper,
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: themeConfig.borderRadius.small,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            background: isDark 
              ? `linear-gradient(135deg, ${colors.accent.primary} 0%, #DC2626 100%)` 
              : `linear-gradient(135deg, ${colors.accent.primary} 0%, #DC2626 100%)`,
            color: '#FFFFFF',
            '&:hover': {
              background: isDark 
                ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' 
                : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            },
            '&:disabled': {
              background: isDark ? '#1F1F1F' : '#E2E8F0',
              color: isDark ? '#666666' : '#94A3B8',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: themeConfig.borderRadius.small,
              backgroundColor: colors.paper,
              '& fieldset': {
                borderColor: isDark ? '#3F3F46' : '#CBD5E1',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#52525B' : '#94A3B8',
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.accent.primary,
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root': {
              color: colors.text.secondary,
              '&.Mui-focused': {
                color: colors.accent.primary,
              },
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: colors.paper,
                paddingLeft: '4px',
                paddingRight: '4px',
              },
            },
            '& .MuiInputBase-input': {
              color: colors.text.primary,
              '&:-webkit-autofill': {
                WebkitBoxShadow: `0 0 0 100px ${colors.paper} inset`,
                WebkitTextFillColor: colors.text.primary,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: colors.paper,
            color: colors.text.primary,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#3F3F46' : '#CBD5E1',
              borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#52525B' : '#94A3B8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.accent.primary,
              borderWidth: '2px',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: colors.paper,
            color: colors.text.primary,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              },
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: colors.accent.primary,
            height: 8,
            '& .MuiSlider-track': {
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              height: 24,
              width: 24,
              backgroundColor: '#FFFFFF',
              border: `2px solid ${colors.accent.primary}`,
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: `0 0 0 8px rgba(239, 68, 68, 0.16)`,
              },
              '&:before': {
                display: 'none',
              },
            },
          },
        },
      },
    },
  });
};

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('english');
  const [wordCount, setWordCount] = useState(250);
  const [style, setStyle] = useState('normal');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark');
  const [selectedQA, setSelectedQA] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null); // Track which audio is playing
  const [loadingAudioId, setLoadingAudioId] = useState(null); // Track which audio is loading
  const audioInstancesRef = useRef({}); // Store multiple audio instances
  const [isAnswering, setIsAnswering] = useState(false); // Separate loading for Q&A
  const [qaHistory, setQaHistory] = useState(() => {
    const saved = localStorage.getItem('qaHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatMessages, setChatMessages] = useState([]); // Chat-like Q&A messages
  const [videoData, setVideoData] = useState(null); // Store structured video data
  const mediaRecorderRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Helper function to format timestamp to MM:SS
  const formatTimestamp = (timestamp) => {
    // If it's already in MM:SS format, return as is
    if (typeof timestamp === 'string' && timestamp.includes(':')) {
      return timestamp;
    }
    
    // If it's a number or numeric string, convert to seconds and format
    const seconds = typeof timestamp === 'string' ? parseFloat(timestamp) : Number(timestamp);
    if (isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const chunksRef = useRef([]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Save QA history whenever it changes
  useEffect(() => {
    localStorage.setItem('qaHistory', JSON.stringify(qaHistory));
  }, [qaHistory]);

  // Cleanup all audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioInstancesRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  // Text-to-Speech Function
  const languageMap = {
    english: 'en',
    hindi: 'hi',
    marathi: 'mr',
    gujarati: 'gu',
    bengali: 'bn',
    kannada: 'kn',
  };
  
  const speakText = async (text, audioId) => {
    try {
      // Stop any currently playing audio
      if (playingAudioId && audioInstancesRef.current[playingAudioId]) {
        audioInstancesRef.current[playingAudioId].pause();
        audioInstancesRef.current[playingAudioId].currentTime = 0;
        delete audioInstancesRef.current[playingAudioId];
      }

      setLoadingAudioId(audioId);
      const langCode = languageMap[language];
      
      const response = await axios.post(`${config.apiBaseUrl}/text-to-speech`, {
        text: text,
        lang: langCode
      });
  
      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
  
      // Store the audio instance with unique ID
      audioInstancesRef.current[audioId] = audio;
      setLoadingAudioId(null);
      setPlayingAudioId(audioId);
  
      audio.onended = () => {
        setPlayingAudioId(null);
        delete audioInstancesRef.current[audioId];
      };
      
      audio.onerror = () => {
        setPlayingAudioId(null);
        delete audioInstancesRef.current[audioId];
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing speech:', error);
      setPlayingAudioId(null);
      setLoadingAudioId(null);
    }
  };
  
  const stopSpeaking = (audioId) => {
    if (audioInstancesRef.current[audioId]) {
      audioInstancesRef.current[audioId].pause();
      audioInstancesRef.current[audioId].currentTime = 0;
      delete audioInstancesRef.current[audioId];
      setPlayingAudioId(null);
    }
  };
  
  

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/m4a' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          try {
            const response = await axios.post(`${config.apiBaseUrl}/speech-to-text`, {
              audio_data: base64Audio,
              language: language
            });
            setQuestion(response.data.text);
          } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
              console.log('Transcription canceled by user');
            } else {
              console.error('Error transcribing speech:', error);
              alert('Failed to transcribe audio. Please try again.');
            }
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setAnswer('');
    setQuestion('');
    setVideoData(null);

    try {
      const response = await axios.post(`${config.apiBaseUrl}/process-video`, {
        video_url: videoUrl,
        style: style,
        word_count: wordCount,
        language: language
      }, {
        signal: abortControllerRef.current.signal
      });
      setVideoData(response.data);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Summarization canceled by user');
      } else {
        console.error('Error:', error);
        alert('Failed to process video. Please check the URL and try again.');
      }
      setVideoData(null);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelSummarization = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      abortControllerRef.current = null;
    }
  };
  

  const handleQuestion = async () => {
    if (!question.trim()) return;
    
    const userQuestion = question;
    
    // Add user message immediately
    setChatMessages(prev => [...prev, { type: 'question', text: userQuestion }]);
    setQuestion(''); // Clear input immediately
    
    try {
      setIsAnswering(true);
      const response = await axios.post(`${config.apiBaseUrl}/ask-question`, {
        video_url: videoUrl,
        question: userQuestion,
        language: language,
        question_type: 'text'
      });
      
      const newAnswer = response.data.answer;
      
      // Add answer message
      setChatMessages(prev => [...prev, { type: 'answer', text: newAnswer }]);
      
      // Update history with new Q/A pair while keeping last 3
      setQaHistory(prevHistory => {
        const newHistory = [
          {
            question: userQuestion,
            answer: newAnswer,
            timestamp: new Date().toISOString(),
            videoUrl // Store video URL with each Q/A pair
          },
          ...prevHistory
        ].slice(0, 3);
        return newHistory;
      });
      
    } catch (error) {
      console.error('Error asking question:', error);
      setChatMessages(prev => [...prev, { type: 'error', text: 'Failed to get answer. Please try again.' }]);
    } finally {
      setIsAnswering(false);
    }
  };

  const truncateAnswer = (answer, wordLimit = 15) => {
    const words = answer.split(' ');
    if (words.length <= wordLimit) return answer;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const clearHistory = () => {
    setQaHistory([]);
    localStorage.removeItem('qaHistory');
  };

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
            : '#0A0A0A',
          color: mode === 'light' ? '#1E293B' : '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Header with Theme Toggle */}
        <Box sx={{ 
          padding: { xs: '1.5rem', md: '2rem 3rem' },
          borderBottom: mode === 'dark' 
            ? `1px solid ${themeConfig.colors.dark.border.default}` 
            : `1px solid ${themeConfig.colors.light.border.default}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: mode === 'dark' 
            ? themeConfig.colors.dark.background 
            : 'transparent',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: mode === 'dark' 
                ? themeConfig.colors.dark.accent.primary 
                : themeConfig.colors.light.accent.primary,
              mr: 0.5
            }} />
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: mode === 'dark' 
                ? themeConfig.colors.dark.accent.primary 
                : themeConfig.colors.light.accent.primary
            }} />
            <Typography 
              variant="h4" 
              sx={{ 
                color: mode === 'dark' 
                  ? themeConfig.colors.dark.text.primary 
                  : themeConfig.colors.light.text.primary,
                fontWeight: 700,
                ml: 1,
                fontFamily: themeConfig.typography.fontFamily
              }}
            >
              Summarify-Utube
            </Typography>
          </Box>
          <IconButton 
            onClick={toggleMode} 
            sx={{ 
              position: 'absolute',
              right: { xs: '1.5rem', md: '3rem' },
              color: mode === 'dark' 
                ? themeConfig.colors.dark.text.primary 
                : themeConfig.colors.light.text.primary,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)'
              }
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {/* Drawer for Summary Form */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? 4000 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
              backgroundColor: mode === 'dark' ? '#0F0F0F' : '#F7F7F8',
              borderRight: `1px solid ${mode === 'dark' ? '#2A2A2A' : '#E5E5E5'}`,
              top: 0,
              height: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sidebar Logo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 3,
              px: 1,
              py: 2
            }}>
              <Box sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                backgroundColor: mode === 'dark' ? '#EF4444' : '#EF4444'
              }} />
              <Box sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                backgroundColor: mode === 'dark' ? '#EF4444' : '#EF4444'
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: mode === 'dark' ? '#ECECEC' : '#2A2A2A',
                  fontWeight: 700,
                  ml: 0.5,
                  fontSize: '1.1rem'
                }}
              >
                Summarify-Utube
              </Typography>
            </Box>

            {/* Generate Summary Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                mb: 2,
                px: 1
              }}>
                Generate Summary
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="YouTube Video URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste your YouTube URL here..."
                  size="small"
                  sx={{ mb: 1.5 }}
                />

                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                  mb: 0.5,
                  display: 'block',
                  fontSize: '0.75rem'
                }}>
                  Select Language
                </Typography>
                <Select
                  fullWidth
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  size="small"
                  sx={{ mb: 1.5 }}
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">हिंदी (Hindi)</MenuItem>
                  <MenuItem value="marathi">मराठी (Marathi)</MenuItem>
                  <MenuItem value="gujarati">ગુજરાતી (Gujarati)</MenuItem>
                  <MenuItem value="bengali">বাংলা (Bengali)</MenuItem>
                  <MenuItem value="kannada">ಕನ್ನಡ (Kannada)</MenuItem>
                </Select>

                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                  mb: 0.5,
                  display: 'block',
                  fontSize: '0.75rem'
                }}>
                  Word Count: {wordCount}
                </Typography>
                <Slider
                  value={wordCount}
                  onChange={(e, newValue) => setWordCount(newValue)}
                  min={100}
                  max={500}
                  step={50}
                  size="small"
                  sx={{ mb: 1 }}
                />
  <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                  mb: 0.5,
                  display: 'block',
                  fontSize: '0.75rem'
                }}>
                  Select Style
                </Typography>
                <Select
                  fullWidth
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  size="small"
                  sx={{ mb: 5 }}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="concise">Concise</MenuItem>
                </Select>

                {loading ? (
                  <Button
                    onClick={handleCancelSummarization}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      '&:hover': {
                        borderColor: '#DC2626',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      }
                    }}
                  >
                    ✕ Cancel Summarization
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                  >
                    Generate Summary
                  </Button>
                )}
              </form>
            </Box>

            {/* Q/A History */}
            {qaHistory.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 1.5,
                  px: 1,
                  mt: 2
                }}>
                  <Typography variant="caption" sx={{ 
                    color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}>
                    Recent
                  </Typography>
                  <IconButton 
                    onClick={clearHistory} 
                    size="small"
                    sx={{ 
                      color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                      padding: '4px',
                      '&:hover': {
                        color: mode === 'dark' ? '#EF4444' : '#DC2626',
                        backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'
                      }
                    }}
                  >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxHeight: '320px',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: mode === 'dark' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: mode === 'dark' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(148, 163, 184, 0.5)',
                  },
                }}>
                  {qaHistory.map((item, index) => (
                    <Box 
                      key={index} 
                      onClick={() => setSelectedQA(item)}
                      sx={{ 
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: 'none',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? '#2A2A2A' : '#ECECEC',
                        },
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 400,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: mode === 'dark' ? '#ECECEC' : '#2A2A2A',
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          mb: 0.5
                        }}
                      >
                        {item.question}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          fontSize: '0.7rem',
                          color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                        }}
                      >
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Main Content Area */}
        <Box sx={{
          marginLeft: drawerOpen ? '400px' : 0,
          transition: 'margin-left 0.3s ease',
          flex: 1,
          padding: { xs: '1.5rem', md: '2rem 3rem' },
          width: drawerOpen ? 'calc(100% - 400px)' : '100%',
          boxSizing: 'border-box'
        }}>
          {/* Toggle Drawer Button */}
          {videoData && (
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{
                position: 'fixed',
                left: drawerOpen ? 270 : 10,
                top: 85,
                zIndex: 1200,
                backgroundColor: mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
                border: `1px solid ${mode === 'dark' ? '#2A2A2A' : '#E5E5E5'}`,
                transition: 'left 0.3s ease',
                boxShadow: mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#2A2A2A' : '#F7F7F8',
                },
              }}
            >
              <MenuIcon sx={{ fontSize: '1.3rem' }} />
            </IconButton>
          )}

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2rem',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}>
            {loading ? (
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                textAlign: 'center',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  border: `4px solid ${mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(110, 231, 183, 0.2)'}`,
                  borderTopColor: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                  animation: 'spin 1s linear infinite',
                  mb: 3,
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <Typography variant="h6" sx={{ 
                  color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                  mb: 1,
                  fontWeight: 600
                }} gutterBottom>
                  🎬 Analyzing Video...
              </Typography>
                <Typography variant="body2" sx={{ 
                  color: mode === 'dark' ? '#A1A1AA' : '#64748B',
                  maxWidth: '400px'
                }}>
                  Processing transcript, extracting key points, and generating comprehensive summary. This may take 30-60 seconds.
                </Typography>
              </Paper>
            ) : videoData ? (
              <>
                 {/* YouTube Video Section */}
                 <Paper elevation={0} sx={{ overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                   {videoData.video_id && (
                     <Box sx={{ 
                       position: 'relative', 
                       paddingTop: '56.25%', // 16:9 aspect ratio
                       backgroundColor: '#000',
                       borderRadius: '12px 12px 0 0',
                       overflow: 'hidden',
                       width: '100%',
                       maxWidth: '100%'
                     }}>
                       <iframe
                         width="100%"
                         height="100%"
                         src={`https://www.youtube.com/embed/${videoData.video_id}`}
                         title={videoData.video_title || "YouTube Video"}
                         frameBorder="0"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                         allowFullScreen
                         style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           width: '100%',
                           height: '100%',
                           maxWidth: '100%'
                         }}
                       />
                     </Box>
                   )}
                   <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
                     <Typography 
                       variant="h5" 
                       gutterBottom
                       sx={{ 
                         fontWeight: 600,
                         mb: 2,
                         lineHeight: 1.4,
                         wordBreak: 'break-word',
                         overflowWrap: 'break-word'
                       }}
                     >
                       {videoData.video_title || "YouTube Video"}
                     </Typography>
                     
                     {/* Tags */}
                     {videoData.tags && videoData.tags.length > 0 && (
                  <Box sx={{ 
                    mb: 3,
                    mt: 2
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1.5 
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: mode === 'dark' ? '#A855F7' : '#6EE7B7', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        📚 Tags
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      width: '100%',
                      maxWidth: '100%'
                    }}>
                      {videoData.tags.map((tag, index) => (
                        <Box
                          key={index}
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '20px',
                            backgroundColor: mode === 'dark' ? '#1E1B4B' : 'rgba(110, 231, 183, 0.2)',
                            border: '1px solid',
                            borderColor: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                            fontSize: '0.875rem',
                            color: mode === 'dark' ? '#FFFFFF' : '#6EE7B7',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: mode === 'dark' ? '#312E81' : 'rgba(110, 231, 183, 0.3)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                    )}
                  </Box>
                </Paper>
            {/* Full Summary */}
                 {videoData.summary && (
                   <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
                     <Box sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'space-between', 
                       mb: 2,
                       flexWrap: 'wrap',
                       gap: 1
                     }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="h6" sx={{ 
                           fontWeight: 600,
                           color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
                         }}>
                           Summary
                         </Typography>
                       </Box>
                  <IconButton 
                    onClick={() => {
                      const audioId = 'summary';
                      if (playingAudioId === audioId) {
                        stopSpeaking(audioId);
                      } else {
                        speakText(videoData.summary, audioId);
                      }
                    }}
                    disabled={loadingAudioId === 'summary'}
                         sx={{ 
                           backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(110, 231, 183, 0.2)',
                           color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                           flexShrink: 0,
                           '&:hover': {
                             backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(110, 231, 183, 0.3)'
                           },
                           '&.Mui-disabled': {
                             backgroundColor: mode === 'dark' ? 'rgba(161, 161, 170, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                             color: '#A1A1AA'
                           }
                         }}
                  >
                    {loadingAudioId === 'summary' ? (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    ) : playingAudioId === 'summary' ? <StopIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Box>
                     <Typography 
                       sx={{ 
                         whiteSpace: 'pre-wrap',
                         color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                         lineHeight: 1.8,
                         fontSize: '1rem',
                         wordBreak: 'break-word',
                         overflowWrap: 'break-word',
                         width: '100%',
                         maxWidth: '100%'
                       }}
                     >
                       {videoData.summary}
                     </Typography>
                   </Paper>
                 )}
                 {/* Key Takeaway */}
                 {videoData.key_takeaway && (
                   <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                       <Typography 
                         variant="subtitle2" 
                         sx={{ 
                           color: mode === 'dark' ? '#60A5FA' : '#3B82F6', 
                           fontWeight: 600,
                           fontSize: '0.875rem',
                           textTransform: 'uppercase',
                           letterSpacing: '0.05em'
                         }}
                       >
                         🧩 Key Takeaway
                       </Typography>
                     </Box>
                     <Box sx={{
                       p: 2,
                       borderRadius: '8px',
                       backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                       borderLeft: `3px solid ${mode === 'dark' ? '#60A5FA' : '#3B82F6'}`,
                       mt: 1
                     }}>
                       <Typography 
                         sx={{ 
                           color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                           lineHeight: 1.7,
                           fontSize: '1.1rem',
                           fontStyle: 'italic',
                           wordBreak: 'break-word',
                           overflowWrap: 'break-word',
                           width: '100%',
                           maxWidth: '100%'
                         }}
                       >
                         {videoData.key_takeaway}
                       </Typography>
                     </Box>
                   </Paper>
                 )}

                 {/* Key Points */}
                 {videoData.key_points && videoData.key_points.length > 0 && (
                   <Accordion 
                     defaultExpanded
                     sx={{
                       backgroundColor: mode === 'dark' ? themeConfig.colors.dark.paper : themeConfig.colors.light.paper,
                       border: `1px solid ${mode === 'dark' ? themeConfig.colors.dark.border.default : themeConfig.colors.light.border.default}`,
                       borderRadius: `${themeConfig.borderRadius.large} !important`,
                       '&:before': { display: 'none' },
                       mb: 2,
                       '&:focus-within': {
                         outline: 'none'
                       },
                       '& .MuiAccordionSummary-root': {
                         '&:focus': {
                           outline: 'none'
                         }
                       }
                     }}
                   >
                     <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FBBF24' }} />}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography 
                           variant="subtitle2" 
                           sx={{ 
                             color: mode === 'dark' ? '#FBBF24' : '#F59E0B', 
                             fontWeight: 600,
                             fontSize: '0.875rem',
                             textTransform: 'uppercase',
                             letterSpacing: '0.05em'
                           }}
                         >
                           ✓ Key Points ({videoData.key_points.length})
                         </Typography>
                       </Box>
                     </AccordionSummary>
                     <AccordionDetails>
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                         {videoData.key_points.map((point, index) => (
                           <Box 
                             key={index}
                             sx={{
                               p: 2,
                               borderRadius: '8px',
                               backgroundColor: mode === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.15)',
                               borderLeft: '3px solid #FBBF24',
                               display: 'flex',
                               alignItems: 'flex-start',
                               gap: 1.5,
                               width: '100%',
                               maxWidth: '100%',
                               boxSizing: 'border-box'
                             }}
                           >
                             <Typography 
                               sx={{ 
                                 color: '#FBBF24',
                                 fontWeight: 600,
                                 minWidth: '24px',
                                 flexShrink: 0
                               }}
                             >
                               {index + 1}.
                             </Typography>
                             <Typography sx={{ 
                               color: 'text.primary',
                               lineHeight: 1.7, 
                               flex: 1,
                               wordBreak: 'break-word',
                               overflowWrap: 'break-word',
                               minWidth: 0
                             }}>
                               {point}
                             </Typography>
                           </Box>
                         ))}
                       </Box>
                     </AccordionDetails>
                   </Accordion>
                 )}

                 {/* How It Started */}
                 {videoData.how_it_started && (
                   <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
                     <Typography variant="h6" gutterBottom sx={{ 
                       fontWeight: 600, 
                       mb: 2,
                       color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
                     }}>
                       How It Started
                     </Typography>
                     <Typography 
                       sx={{ 
                         color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                         lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                         wordBreak: 'break-word',
                         overflowWrap: 'break-word',
                         width: '100%',
                         maxWidth: '100%'
                       }}
                     >
                       {videoData.how_it_started}
                     </Typography>
                   </Paper>
                 )}

                 {/* Top Topics with Timestamps */}
                 {videoData.top_topics && videoData.top_topics.length > 0 && (
                   <Accordion 
                     defaultExpanded
                     sx={{
                       backgroundColor: mode === 'dark' ? themeConfig.colors.dark.paper : themeConfig.colors.light.paper,
                       border: `1px solid ${mode === 'dark' ? themeConfig.colors.dark.border.default : themeConfig.colors.light.border.default}`,
                       borderRadius: `${themeConfig.borderRadius.large} !important`,
                       '&:before': { display: 'none' },
                       mb: 2,
                       '&:focus-within': {
                         outline: 'none'
                       },
                       '& .MuiAccordionSummary-root': {
                         '&:focus': {
                           outline: 'none'
                         }
                       }
                     }}
                   >
                     <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: mode === 'dark' ? '#A855F7' : '#6EE7B7' }} />}>
                       <Typography variant="h6" sx={{ 
                         fontWeight: 600,
                         color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
                       }}>
                         📌 Important Topics ({videoData.top_topics.length})
                       </Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                       {videoData.top_topics.map((topic, index) => (
                         <Box 
                          key={index}
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(148, 163, 184, 0.3)',
                            backgroundColor: mode === 'dark' ? '#1A1A1A' : 'rgba(248, 250, 252, 0.5)',
                            transition: 'all 0.2s ease-in-out',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            '&:hover': {
                              borderColor: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                              backgroundColor: mode === 'dark' ? '#222222' : 'rgba(248, 250, 252, 0.8)',
                              transform: { xs: 'none', md: 'translateX(4px)' }
                            }
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: { xs: 1, md: 2 }, 
                            mb: 1,
                            flexWrap: 'wrap',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            overflow: 'visible'
                          }}>
                            <Typography 
                              component="span"
                              sx={{ 
                                color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                flex: { xs: '1 1 100%', md: '0 1 auto' },
                                minWidth: { xs: '100%', md: 'fit-content' },
                                maxWidth: { xs: '100%', md: '80px' },
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'normal',
                                lineHeight: 1.5,
                                mb: { xs: 0.5, md: 0 }
                              }}
                            >
                              {topic.timestamp ? formatTimestamp(topic.timestamp) : `${Math.floor((index + 1) * 10)}:00`}
                            </Typography>
                            <Typography 
                              component="span"
                              sx={{ 
                                color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                                fontWeight: 600,
                                flex: { xs: '1 1 100%', md: '1 1 0%' },
                                minWidth: 0,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: '100%',
                                boxSizing: 'border-box',
                                lineHeight: 1.5
                              }}
                            >
                              {topic.topic}
                            </Typography>
                          </Box>
                          <Typography 
                            sx={{ 
                              color: mode === 'dark' ? '#A1A1AA' : '#64748B',
                              lineHeight: 1.6,
                              ml: { xs: 0, md: '66px' },
                              fontSize: '0.9rem',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              width: '100%',
                              maxWidth: '100%',
                              boxSizing: 'border-box',
                              mt: { xs: 1, md: 0.5 }
                            }}
                          >
                            {topic.description}
                          </Typography>
                        </Box>
                       ))}
                     </Box>
                     </AccordionDetails>
                   </Accordion>
                 )}

                 {/* New Things */}
                 {videoData.new_things && videoData.new_things.length > 0 && (
                   <Accordion 
                     sx={{
                       backgroundColor: mode === 'dark' ? themeConfig.colors.dark.paper : themeConfig.colors.light.paper,
                       border: `1px solid ${mode === 'dark' ? themeConfig.colors.dark.border.default : themeConfig.colors.light.border.default}`,
                       borderRadius: `${themeConfig.borderRadius.large} !important`,
                       '&:before': { display: 'none' },
                       mb: 2,
                       '&:focus-within': {
                         outline: 'none'
                       },
                       '& .MuiAccordionSummary-root': {
                         '&:focus': {
                           outline: 'none'
                         }
                       }
                     }}
                   >
                     <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: mode === 'dark' ? '#60A5FA' : '#3B82F6' }} />}>
                       <Typography variant="h6" sx={{ 
                         fontWeight: 600,
                         color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
                       }}>
                         ✨ New & Interesting Things ({videoData.new_things.length})
                       </Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                       {videoData.new_things.map((thing, index) => (
                         <Box 
                           key={index}
                           sx={{
                             p: 2,
                             borderRadius: '8px',
                             backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
                             borderLeft: '3px solid',
                             borderLeftColor: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                             display: 'flex',
                             alignItems: 'flex-start',
                             gap: 1.5,
                             width: '100%',
                             maxWidth: '100%',
                             boxSizing: 'border-box'
                           }}
                         >
                           <Typography 
                             sx={{ 
                               color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                               fontWeight: 600,
                               fontSize: '1.2rem',
                               flexShrink: 0
                             }}
                           >
                             ✨
                           </Typography>
                           <Typography sx={{ 
                             color: mode === 'dark' ? '#FFFFFF' : '#1E293B', 
                             lineHeight: 1.7, 
                             flex: 1,
                             wordBreak: 'break-word',
                             overflowWrap: 'break-word',
                             minWidth: 0
                           }}>
                             {thing}
                           </Typography>
                         </Box>
                       ))}
                     </Box>
                     </AccordionDetails>
                   </Accordion>
                 )}

     
              </>
            ) : (
              <Paper elevation={0} sx={{ 
                flex: 1,
                p: { xs: 2, md: 3 }
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                  mb: 2
                }}>
                  Summary
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  textAlign: 'center',
                  padding: 2
                }}>
                  <Typography sx={{ 
                    color: mode === 'dark' ? '#A1A1AA' : '#64748B'
                  }}>
                     Enter a YouTube URL and click &quot;Generate Summary&quot; to see the results here.
                  </Typography>
                </Box>
            </Paper>
            )}

            {/* Q&A Section */}
             <Paper elevation={0} sx={{ 
               p: { xs: 2, md: 3 },
               opacity: !videoData ? 0.6 : 1,
               pointerEvents: !videoData ? 'none' : 'auto',
               position: 'relative'
             }}>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="h6" sx={{ 
                   color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
                 }}>
                  Ask a Question
                </Typography>
                {!videoData && (
                  <Typography variant="caption" sx={{ 
                    color: mode === 'dark' ? '#EF4444' : '#DC2626',
                    fontWeight: 600
                  }}>
                    ⚠️ Summarize a video first
                  </Typography>
                )}
              </Box>
               <Box sx={{ 
                 display: 'flex', 
                 gap: 2, 
                 marginBottom: 2,
                 flexWrap: { xs: 'wrap', md: 'nowrap' },
                 width: '100%'
               }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  label={isTranscribing ? "Transcribing..." : "Your Question"}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && question.trim() && !loading && !isTranscribing && videoData) {
                      e.preventDefault();
                      handleQuestion();
                    }
                  }}
                  placeholder={isTranscribing ? "Converting speech to text..." : !videoData ? "Please summarize a video first" : "Type or use microphone to ask a question"}
                  disabled={isTranscribing || !videoData}
                  sx={{ minWidth: 0, flex: 1 }}
                />
                <IconButton 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || !videoData}
                  sx={{
                    color: isRecording ? '#EF4444' : isTranscribing ? '#A1A1AA' : '#6EE7B7',
                    flexShrink: 0,
                    '&:hover': {
                      color: isRecording ? '#DC2626' : '#34D399',
                    },
                    '&.Mui-disabled': {
                      color: '#A1A1AA',
                    },
                    transition: 'color 0.2s ease-in-out',
                    animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                >
                  {isRecording ? <StopIcon /> : <MicIcon />}
                </IconButton>
              </Box>
              
              {isTranscribing ? (
                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                  display: 'block',
                  mb: 2,
                  fontStyle: 'italic'
                }}>
                  🎤 Converting your speech to text...
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#71717A' : '#94A3B8',
                  display: 'block',
                  mb: 2
                }}>
                  💡 Tip: Press Enter to ask, Shift+Enter for new line
                </Typography>
              )}

              <Button
                onClick={handleQuestion}
                variant="contained"
                fullWidth
                disabled={isAnswering || !question.trim() || isTranscribing || !videoData}
              >
                {isAnswering ? 'Getting Answer...' : 'Ask Question'}
              </Button>

              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <Box sx={{ 
                  marginTop: 3, 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '3px',
                  },
                }}>
                  {chatMessages.map((msg, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: msg.type === 'question' ? 'flex-end' : 'flex-start'
                    }}>
                      {msg.type === 'question' ? (
                        <Box sx={{
                          backgroundColor: mode === 'dark' ? '#2A2A2A' : '#E5E5E5',
                          color: mode === 'dark' ? '#ECECEC' : '#2A2A2A',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          maxWidth: '80%',
                          wordBreak: 'break-word'
                        }}>
                          <Typography variant="body2">{msg.text}</Typography>
                        </Box>
                      ) : msg.type === 'answer' ? (
                        <Box sx={{ maxWidth: '85%' }}>
                          <Box sx={{
                            backgroundColor: mode === 'dark' ? '#1A1A1A' : '#F7F7F8',
                            color: mode === 'dark' ? '#ECECEC' : '#2A2A2A',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: `1px solid ${mode === 'dark' ? '#2A2A2A' : '#E5E5E5'}`,
                            wordBreak: 'break-word'
                          }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {msg.text}
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              const audioId = `chat-${index}`;
                              if (playingAudioId === audioId) {
                                stopSpeaking(audioId);
                              } else {
                                speakText(msg.text, audioId);
                              }
                            }}
                            disabled={loadingAudioId === `chat-${index}`}
                            sx={{ 
                              mt: 0.5,
                              ml: 1,
                              color: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                              '&:hover': {
                                color: mode === 'dark' ? '#A855F7' : '#6EE7B7'
                              }
                            }}
                          >
                            {loadingAudioId === `chat-${index}` ? (
                              <Box sx={{ 
                                width: 16, 
                                height: 16, 
                                border: '2px solid currentColor',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                              }} />
                            ) : playingAudioId === `chat-${index}` ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#EF4444', fontStyle: 'italic' }}>
                          {msg.text}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {isAnswering && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        backgroundColor: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 0.3 },
                          '50%': { opacity: 1 },
                        },
                      }} />
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        backgroundColor: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                        animation: 'pulse 1.5s ease-in-out infinite 0.2s',
                      }} />
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        backgroundColor: mode === 'dark' ? '#8E8E8E' : '#6B6B6B',
                        animation: 'pulse 1.5s ease-in-out infinite 0.4s',
                      }} />
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Q/A Dialog */}
      <Dialog 
        open={Boolean(selectedQA)} 
        onClose={() => setSelectedQA(null)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            backgroundColor: mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
            border: mode === 'dark' 
              ? '1px solid rgba(168, 85, 247, 0.2)' 
              : '1px solid rgba(148, 163, 184, 0.2)'
          }
        }}
      >
        {selectedQA && (
          <>
            <DialogTitle sx={{ 
              borderBottom: mode === 'dark' 
                ? '1px solid rgba(168, 85, 247, 0.2)' 
                : '1px solid rgba(148, 163, 184, 0.2)',
              color: mode === 'dark' ? '#FFFFFF' : '#1E293B'
            }}>
              <Typography variant="h6" component="div">
                Question & Answer
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ 
              color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
              p: { xs: 2, md: 3 }
            }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                  fontWeight: 600,
                  mb: 1
                }} gutterBottom>
                  Question:
                </Typography>
                <Typography variant="body1" paragraph sx={{ 
                  color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                  mb: 2
                }}>
                  {selectedQA.question}
                </Typography>
                {/* speaking button */}
                <IconButton 
                  onClick={() => {
                    const audioId = 'dialog-question';
                    if (playingAudioId === audioId) {
                      stopSpeaking(audioId);
                    } else {
                      speakText(selectedQA.question, audioId);
                    }
                  }}
                  disabled={loadingAudioId === 'dialog-question'}
                  sx={{ 
                    mt: 1,
                    backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(110, 231, 183, 0.2)',
                    color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(110, 231, 183, 0.3)'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: mode === 'dark' ? 'rgba(161, 161, 170, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      color: '#A1A1AA'
                    }
                  }}
                >
                  {loadingAudioId === 'dialog-question' ? (
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  ) : playingAudioId === 'dialog-question' ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                  fontWeight: 600,
                  mb: 1
                }} gutterBottom>
                  Answer:
                </Typography>
                <Typography variant="body1" sx={{ 
                  whiteSpace: 'pre-wrap',
                  color: mode === 'dark' ? '#FFFFFF' : '#1E293B',
                  mb: 2,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {selectedQA.answer}
                </Typography>
                {/* speaking button */}
                <IconButton 
                  onClick={() => {
                    const audioId = 'dialog-answer';
                    if (playingAudioId === audioId) {
                      stopSpeaking(audioId);
                    } else {
                      speakText(selectedQA.answer, audioId);
                    }
                  }}
                  disabled={loadingAudioId === 'dialog-answer'}
                  sx={{ 
                    mt: 1,
                    backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(110, 231, 183, 0.2)',
                    color: mode === 'dark' ? '#A855F7' : '#6EE7B7',
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(110, 231, 183, 0.3)'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: mode === 'dark' ? 'rgba(161, 161, 170, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      color: '#A1A1AA'
                    }
                  }}
                >
                  {loadingAudioId === 'dialog-answer' ? (
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  ) : playingAudioId === 'dialog-answer' ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 2,
                  color: mode === 'dark' ? '#A1A1AA' : '#64748B',
                  textAlign: 'center'
                }}
              >
                Press ESC or click outside to close
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </ThemeProvider>
  );
}

export default App;