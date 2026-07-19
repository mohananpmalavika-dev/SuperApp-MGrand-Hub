import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  ArrowBack,
  School,
  Quiz,
  TrendingUp,
  EmojiEvents,
  PlayArrow,
  CheckCircle,
  Timer,
  LocalFireDepartment,
  Settings,
} from '@mui/icons-material';
import axios from 'axios';
import VoiceAvatar from '../components/VoiceAvatar';
import { API_ENDPOINTS } from '../config/api.config';
import './TutorDashboard.css';

const API_URL = process.env.REACT_APP_TUTOR_SERVICE_URL || 'http://localhost:3013';

function TutorDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [voicePreferences, setVoicePreferences] = useState(null);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchVoicePreferences();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tutor/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard');
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

  const handleVoiceInput = async (transcript) => {
    console.log('Voice input received:', transcript);
    // Handle voice commands here
    speakText(`You said: ${transcript}`);
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

  const startNewSession = () => {
    navigate('/tutor/session/new');
  };

  const takeQuiz = () => {
    navigate('/tutor/quiz/new');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <div className="tutor-dashboard">
      {/* App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎓 Personal Tutor
          </Typography>
          <Button color="inherit" startIcon={<PlayArrow />} onClick={startNewSession}>
            New Session
          </Button>
          <IconButton color="inherit" onClick={() => setShowVoiceDialog(true)}>
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Voice Avatar Dialog */}
      <Dialog open={showVoiceDialog} onClose={() => setShowVoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Voice Assistant Settings</DialogTitle>
        <DialogContent>
          <VoiceAvatar
            avatarUrl={voicePreferences?.avatarUrl}
            tutorName={voicePreferences?.customAvatarName || 'AI Tutor'}
            scenario={voicePreferences?.preferredScenario || 'room'}
            onVoiceInput={handleVoiceInput}
            onSettingsChange={handleSettingsChange}
            speaking={speaking}
            voiceEnabled={voicePreferences?.enableVoiceInput !== false}
          />
        </DialogContent>
      </Dialog>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}! 🌟
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue your learning journey
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Sessions</Typography>
                </Box>
                <Typography variant="h3">{dashboard?.stats?.totalSessions || 0}</Typography>
                <Typography variant="body2">Learning sessions</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4ECDC4', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Quiz sx={{ mr: 1 }} />
                  <Typography variant="h6">Quizzes</Typography>
                </Box>
                <Typography variant="h3">{dashboard?.stats?.totalQuizzes || 0}</Typography>
                <Typography variant="body2">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#F38181', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg Score</Typography>
                </Box>
                <Typography variant="h3">{dashboard?.stats?.avgQuizScore || 0}%</Typography>
                <Typography variant="body2">Quiz performance</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFA07A', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmojiEvents sx={{ mr: 1 }} />
                  <Typography variant="h6">Points</Typography>
                </Box>
                <Typography variant="h3">{dashboard?.stats?.totalPoints || 0}</Typography>
                <Typography variant="body2">Total earned</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Streak Card */}
        {dashboard?.stats?.learningStreak > 0 && (
          <Card sx={{ mb: 4, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalFireDepartment sx={{ fontSize: 48, color: '#FF6B6B', mr: 2 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {dashboard.stats.learningStreak} Day Streak! 🔥
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Keep learning every day to maintain your streak
                    </Typography>
                  </Box>
                </Box>
                <Button variant="contained" onClick={startNewSession}>
                  Continue Streak
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Active Sessions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                {dashboard?.activeSessions?.length > 0 ? (
                  <List>
                    {dashboard.activeSessions.map((session) => (
                      <ListItem
                        key={session._id}
                        button
                        onClick={() => navigate(`/tutor/session/${session._id}`)}
                      >
                        <ListItemIcon>
                          <School color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${session.subject}: ${session.topic}`}
                          secondary={
                            <Box>
                              <LinearProgress
                                variant="determinate"
                                value={session.progress || 0}
                                sx={{ my: 1 }}
                              />
                              <Typography variant="caption">
                                {session.progress}% complete
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No active sessions</Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={startNewSession}
                      sx={{ mt: 2 }}
                    >
                      Start Learning
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Quizzes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Quizzes
                </Typography>
                {dashboard?.recentQuizzes?.length > 0 ? (
                  <List>
                    {dashboard.recentQuizzes.slice(0, 5).map((quiz, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {quiz.passed ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Timer color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={quiz.topic}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`${quiz.score}%`}
                                size="small"
                                color={quiz.score >= 70 ? 'success' : 'warning'}
                              />
                              <Typography variant="caption">
                                {new Date(quiz.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No quizzes taken yet</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Quiz />}
                      onClick={takeQuiz}
                      sx={{ mt: 2 }}
                    >
                      Take Quiz
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Learning Paths */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Learning Paths
                </Typography>
                {dashboard?.learningPaths?.length > 0 ? (
                  <List>
                    {dashboard.learningPaths.map((path) => (
                      <ListItem
                        key={path._id}
                        button
                        onClick={() => navigate(`/tutor/path/${path._id}`)}
                      >
                        <ListItemText
                          primary={path.pathName}
                          secondary={
                            <Box>
                              <LinearProgress
                                variant="determinate"
                                value={path.progress}
                                sx={{ my: 1 }}
                              />
                              <Typography variant="caption">
                                {path.progress}% complete
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip label={path.status} size="small" />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No learning paths yet</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Create Path
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>
                {dashboard?.achievements?.length > 0 ? (
                  <List>
                    {dashboard.achievements.slice(0, 5).map((achievement, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#FFD700' }}>
                            {achievement.icon || '🏆'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={achievement.name}
                          secondary={achievement.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      Start learning to unlock achievements
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommended for You
                </Typography>
                <Grid container spacing={2}>
                  {dashboard?.recommendations?.length > 0 ? (
                    dashboard.recommendations.map((rec, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {rec.message}
                            </Typography>
                            <Button size="small" variant="contained" fullWidth>
                              {rec.action}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" align="center">
                        Complete more sessions to get personalized recommendations
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default TutorDashboard;
