import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { ArrowBack, PlayArrow, Mic } from '@mui/icons-material';
import axios from 'axios';
import VoiceAvatar from '../components/VoiceAvatar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const subjects = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'Data Structures',
  'Algorithms',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Other',
];

const difficulties = [
  { value: 'beginner', label: 'Beginner - New to this topic' },
  { value: 'intermediate', label: 'Intermediate - Some experience' },
  { value: 'advanced', label: 'Advanced - Strong knowledge' },
  { value: 'expert', label: 'Expert - Deep expertise' },
];

const learningStyles = [
  { value: 'visual', label: 'Visual - Learn with diagrams and images' },
  { value: 'auditory', label: 'Auditory - Learn by listening' },
  { value: 'kinesthetic', label: 'Kinesthetic - Learn by doing' },
  { value: 'reading-writing', label: 'Reading/Writing - Learn from text' },
  { value: 'balanced', label: 'Balanced - Mix of all styles' },
];

function NewSessionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voicePreferences, setVoicePreferences] = useState(null);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    learningGoal: '',
    learningStyle: 'balanced',
  });

  useEffect(() => {
    fetchVoicePreferences();
  }, []);

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

  const handleVoiceInput = (transcript) => {
    // Parse voice input for topic or learning goal
    setFormData(prev => ({ ...prev, learningGoal: transcript }));
    setShowVoiceDialog(false);
    speakText('I have set your learning goal. Please review and start your session.');
  };

  const handleSettingsChange = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/tutor/voice/preferences`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchVoicePreferences();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voicePreferences?.language === 'en' ? 'en-IN' : 
                     voicePreferences?.language === 'hi' ? 'hi-IN' :
                     voicePreferences?.language === 'ml' ? 'ml-IN' :
                     voicePreferences?.language === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = voicePreferences?.voiceSpeed || 1.0;
    utterance.pitch = voicePreferences?.voicePitch || 1.0;
    
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.topic) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/tutor/sessions/start`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const sessionId = response.data.data.session._id;
        navigate(`/tutor/session/${sessionId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/tutor/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Start New Learning Session
          </Typography>
          <IconButton color="inherit" onClick={() => setShowVoiceDialog(true)}>
            <Mic />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Voice Avatar Dialog */}
      <Dialog open={showVoiceDialog} onClose={() => setShowVoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Voice Assistant - Tell me your learning goal</DialogTitle>
        <DialogContent>
          <VoiceAvatar
            avatarUrl={voicePreferences?.avatarUrl}
            tutorName={voicePreferences?.customAvatarName || 'AI Tutor'}
            scenario={voicePreferences?.preferredScenario || 'classroom'}
            onVoiceInput={handleVoiceInput}
            onSettingsChange={handleSettingsChange}
            speaking={speaking}
            voiceEnabled={voicePreferences?.enableVoiceInput !== false}
          />
        </DialogContent>
      </Dialog>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Let's start your learning journey! 🚀
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Subject *"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Topic *"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Async Programming, React Hooks, Binary Trees"
                    helperText="What specific topic do you want to learn?"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Your Current Level"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    {difficulties.map((diff) => (
                      <MenuItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Learning Style"
                    name="learningStyle"
                    value={formData.learningStyle}
                    onChange={handleChange}
                  >
                    {learningStyles.map((style) => (
                      <MenuItem key={style.value} value={style.value}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Learning Goal (Optional)"
                    name="learningGoal"
                    value={formData.learningGoal}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="What do you want to achieve? e.g., Build a project, Pass an exam, Understand concepts"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/tutor/dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                      disabled={loading}
                    >
                      {loading ? 'Starting...' : 'Start Learning'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Quick Tips
            </Typography>
            <ul style={{ marginLeft: '20px' }}>
              <li>
                <Typography variant="body2">
                  Be honest about your current level - we'll adapt the content to match
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Set a clear learning goal to get more focused content
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Choose your preferred learning style for better retention
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Take your time - there's no rush! Learning is a journey
                </Typography>
              </li>
            </ul>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

export default NewSessionPage;
