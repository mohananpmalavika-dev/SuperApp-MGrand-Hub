import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Check,
} from '@mui/icons-material';
import axios from 'axios';
import VoiceAvatar from '../components/VoiceAvatar';
import './LessonView.css';

const API_URL = process.env.REACT_APP_TUTOR_SERVICE_URL || 'http://localhost:3013';

function LessonView() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [voicePreferences, setVoicePreferences] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    fetchSessionAndLesson();
    fetchVoicePreferences();
  }, [sessionId]);

  useEffect(() => {
    // Auto-play lesson section when changed
    if (autoPlay && lessonContent && currentSection < lessonContent.sections.length) {
      setTimeout(() => {
        speakSection(lessonContent.sections[currentSection]);
      }, 500);
    }
  }, [currentSection, autoPlay, lessonContent]);

  const fetchSessionAndLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tutor/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSession(response.data.data.session);
        setLessonContent(response.data.data.lessonContent);
      }
    } catch (err) {
      setError('Failed to load lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoicePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tutor/voice/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setVoicePreferences(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load voice preferences:', err);
    }
  };

  const speakSection = async (section) => {
    if (!section) return;

    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Generate speech for section
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/tutor/voice/speech/lesson`,
        {
          sessionId,
          sectionIndex: currentSection,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data.metadata.useClientSynthesis) {
        // Use Web Speech API
        const text = getSectionText(section);
        speakText(text);
      }
    } catch (err) {
      console.error('Failed to generate speech:', err);
      // Fallback to direct speech
      const text = getSectionText(section);
      speakText(text);
    }
  };

  const getSectionText = (section) => {
    let text = '';
    if (section.title) text += section.title + '. ';
    if (section.content) text += section.content + ' ';
    if (section.summary) text += section.summary;
    return text.trim();
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      voicePreferences?.language === 'en'
        ? 'en-IN'
        : voicePreferences?.language === 'hi'
        ? 'hi-IN'
        : voicePreferences?.language === 'ml'
        ? 'ml-IN'
        : voicePreferences?.language === 'kn'
        ? 'kn-IN'
        : 'en-IN';
    utterance.rate = voicePreferences?.voiceSpeed || 1.0;
    utterance.pitch = voicePreferences?.voicePitch || 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.pause();
      setSpeaking(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeaking(true);
    } else {
      speakSection(lessonContent.sections[currentSection]);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentSection < lessonContent.sections.length - 1) {
      handleStop();
      setCurrentSection(currentSection + 1);
      updateProgress(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      handleStop();
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSectionComplete = async () => {
    handleStop();
    if (currentSection < lessonContent.sections.length - 1) {
      handleNext();
    } else {
      // Complete session
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/api/tutor/sessions/${sessionId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/tutor/dashboard');
      } catch (err) {
        console.error('Failed to complete session:', err);
      }
    }
  };

  const updateProgress = async (sectionIndex) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/tutor/sessions/${sessionId}/progress`,
        {
          sectionsCompleted: sectionIndex + 1,
          totalSections: lessonContent.sections.length,
          currentSection: lessonContent.sections[sectionIndex].title,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleVoiceInput = (transcript) => {
    // Voice commands
    const command = transcript.toLowerCase();
    if (command.includes('next') || command.includes('continue')) {
      handleNext();
    } else if (command.includes('previous') || command.includes('back')) {
      handlePrevious();
    } else if (command.includes('pause') || command.includes('stop')) {
      handleStop();
    } else if (command.includes('play') || command.includes('speak')) {
      speakSection(lessonContent.sections[currentSection]);
    } else if (command.includes('repeat')) {
      handleStop();
      setTimeout(() => speakSection(lessonContent.sections[currentSection]), 500);
    }
  };

  const handleSettingsChange = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/tutor/voice/preferences`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVoicePreferences();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lessonContent) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load lesson'}</Alert>
      </Container>
    );
  }

  const currentSectionData = lessonContent.sections[currentSection];
  const progress = ((currentSection + 1) / lessonContent.sections.length) * 100;

  return (
    <div className="lesson-view-page">
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/tutor/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{session.topic}</Typography>
            <Typography variant="caption">
              Section {currentSection + 1} of {lessonContent.sections.length}
            </Typography>
          </Box>
          <Chip label={`${Math.round(progress)}% Complete`} color="primary" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Voice Avatar */}
          <Grid item xs={12} md={5}>
            <VoiceAvatar
              avatarUrl={voicePreferences?.avatarUrl}
              tutorName={voicePreferences?.customAvatarName || 'AI Tutor'}
              scenario={voicePreferences?.preferredScenario || 'classroom'}
              onVoiceInput={handleVoiceInput}
              onSettingsChange={handleSettingsChange}
              speaking={speaking}
              voiceEnabled={voicePreferences?.enableVoiceInput !== false}
            />

            {/* Voice Commands Help */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  🎤 Voice Commands
                </Typography>
                <Typography variant="caption" component="div">
                  • "Next" - Go to next section
                  <br />
                  • "Previous" - Go back
                  <br />
                  • "Pause" - Stop speaking
                  <br />
                  • "Play" - Start speaking
                  <br />• "Repeat" - Replay section
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Lesson Content */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    {currentSectionData.type}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {currentSectionData.title}
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    {currentSectionData.content}
                  </Typography>

                  {currentSectionData.examples && currentSectionData.examples.length > 0 && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Examples:
                      </Typography>
                      {currentSectionData.examples.map((example, index) => (
                        <Typography key={index} variant="body2" paragraph>
                          • {example}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {currentSectionData.interactive && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      💡 This is an interactive section. Try the exercises below!
                    </Alert>
                  )}
                </Box>

                {/* Navigation Controls */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e0e0e0',
                    pt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<SkipPrevious />}
                    onClick={handlePrevious}
                    disabled={currentSection === 0}
                  >
                    Previous
                  </Button>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={handlePauseResume}
                      sx={{ bgcolor: '#667eea', color: 'white', '&:hover': { bgcolor: '#5568d3' } }}
                    >
                      {speaking ? <Pause /> : <PlayArrow />}
                    </IconButton>
                    <IconButton onClick={() => speakSection(currentSectionData)}>
                      <VolumeUp />
                    </IconButton>
                  </Box>

                  {currentSection < lessonContent.sections.length - 1 ? (
                    <Button variant="contained" endIcon={<SkipNext />} onClick={handleSectionComplete}>
                      Next Section
                    </Button>
                  ) : (
                    <Button variant="contained" endIcon={<Check />} onClick={handleSectionComplete} color="success">
                      Complete Lesson
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Progress Stepper */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lesson Progress
                </Typography>
                <Stepper activeStep={currentSection} alternativeLabel>
                  {lessonContent.sections.map((section, index) => (
                    <Step key={index}>
                      <StepLabel>{section.title}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default LessonView;
