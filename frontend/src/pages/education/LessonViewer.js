import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Divider,
  Drawer,
  useTheme,
  useMediaQuery,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  RadioButtonUnchecked,
  Menu as MenuIcon,
  Close,
  OndemandVideo,
  Headphones,
  Description,
  Quiz,
  ExpandLess,
  ExpandMore,
  Speed,
  Fullscreen,
  VolumeUp,
} from '@mui/icons-material';
import { fetchLessonById } from '../../store/slices/educationSlice';
import { updateLessonProgress } from '../../store/slices/progressSlice';

const LessonViewer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { currentLesson, loading } = useSelector((state) => state.education);
  
  const [activeTab, setActiveTab] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [expandedModule, setExpandedModule] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const playerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (lessonId) {
      dispatch(fetchLessonById(lessonId));
    }
  }, [dispatch, lessonId]);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Update progress on unmount
      if (lessonId && timeSpent > 0) {
        dispatch(updateLessonProgress({
          lessonId,
          completed: progress > 90,
          timeSpent,
        }));
      }
    };
  }, [dispatch, lessonId, progress, timeSpent]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state) => {
    setProgress(state.played * 100);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + seconds);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  const handleNextLesson = () => {
    // Navigate to next lesson (implement based on course structure)
    console.log('Next lesson');
  };

  const handlePreviousLesson = () => {
    // Navigate to previous lesson
    console.log('Previous lesson');
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !currentLesson) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LinearProgress />
        <Box textAlign="center" py={4}>
          <Typography>Loading lesson...</Typography>
        </Box>
      </Container>
    );
  }

  const lesson = currentLesson;

  // Mock course structure for sidebar
  const courseStructure = [
    {
      moduleNumber: 1,
      title: 'Introduction',
      lessons: [
        { id: '1', title: 'Getting Started', duration: '15:00', completed: true },
        { id: '2', title: 'Key Concepts', duration: '20:00', completed: true },
        { id: lessonId, title: lesson.title, duration: '18:00', completed: false },
      ],
    },
    {
      moduleNumber: 2,
      title: 'Core Topics',
      lessons: [
        { id: '4', title: 'Topic 1', duration: '25:00', completed: false },
        { id: '5', title: 'Topic 2', duration: '30:00', completed: false },
      ],
    },
  ];

  const sidebar = (
    <Box sx={{ width: isMobile ? 280 : '100%', height: '100%', overflow: 'auto' }}>
      <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold">
          Course Content
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {courseStructure.map((module, moduleIndex) => (
          <React.Fragment key={moduleIndex}>
            <ListItemButton
              onClick={() => setExpandedModule(expandedModule === moduleIndex ? -1 : moduleIndex)}
            >
              <ListItemText
                primary={`Module ${module.moduleNumber}: ${module.title}`}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              {expandedModule === moduleIndex ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={expandedModule === moduleIndex} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {module.lessons.map((lessonItem) => (
                  <ListItemButton
                    key={lessonItem.id}
                    selected={lessonItem.id === lessonId}
                    sx={{ pl: 4 }}
                    onClick={() => navigate(`/education/lesson/${lessonItem.id}`)}
                  >
                    <ListItemIcon>
                      {lessonItem.completed ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <RadioButtonUnchecked fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={lessonItem.title}
                      secondary={lessonItem.duration}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h5" fontWeight="bold" flex={1}>
                {lesson.title}
              </Typography>
              <IconButton onClick={handleBookmark}>
                {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip label={lesson.chapter || 'Chapter 1'} size="small" />
              <Chip label={`${Math.round(progress)}% Complete`} size="small" color="primary" />
            </Box>
          </Box>

          {/* Video/Audio Player */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
              <ReactPlayer
                ref={playerRef}
                url={lesson.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                playing={playing}
                controls
                width="100%"
                height="100%"
                playbackRate={playbackRate}
                onProgress={handleProgress}
                onDuration={handleDuration}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </Box>
            <Box p={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={handlePreviousLesson}>
                  <SkipPrevious />
                </IconButton>
                <IconButton onClick={handlePlayPause} color="primary" size="large">
                  {playing ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                </IconButton>
                <IconButton onClick={handleNextLesson}>
                  <SkipNext />
                </IconButton>
                <Box flex={1}>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="textSecondary">
                    {formatTime(duration * progress / 100)} / {formatTime(duration)}
                  </Typography>
                </Box>
                <IconButton onClick={handleSpeedChange} size="small">
                  <Speed />
                  <Typography variant="caption" ml={0.5}>
                    {playbackRate}x
                  </Typography>
                </IconButton>
              </Box>
            </Box>
          </Card>

          {/* Content Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab icon={<Description />} label="Notes" iconPosition="start" />
                <Tab icon={<OndemandVideo />} label="Animations" iconPosition="start" />
                <Tab icon={<Headphones />} label="Audio" iconPosition="start" />
                <Tab icon={<Quiz />} label="Practice" iconPosition="start" />
              </Tabs>
            </Box>

            <CardContent>
              {/* Notes Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Lesson Notes
                  </Typography>
                  <Box
                    sx={{
                      '& h1, & h2, & h3': { fontWeight: 'bold', mt: 3, mb: 2 },
                      '& p': { mb: 2, lineHeight: 1.7 },
                      '& code': {
                        bgcolor: 'grey.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                      },
                    }}
                  >
                    <ReactMarkdown>
                      {lesson.content || `
# ${lesson.title}

## Introduction

This comprehensive lesson covers all the important concepts you need to master this topic. 

## Key Concepts

1. **Concept 1**: Detailed explanation of the first key concept
2. **Concept 2**: Understanding the second important concept
3. **Concept 3**: Deep dive into advanced topics

## Examples

### Example 1: Basic Application

Let's look at a practical example:

- Step 1: Setup
- Step 2: Implementation
- Step 3: Verification

### Example 2: Advanced Usage

Building on the basics, here's a more complex scenario.

## Common Mistakes to Avoid

⚠️ Make sure to avoid these common pitfalls:
- Mistake 1
- Mistake 2
- Mistake 3

## Quick Revision

📝 Key points to remember:
- Point 1
- Point 2
- Point 3

## Exam Tips

🎯 How this topic appears in exams:
- Frequently asked questions
- Important formulas
- Time management tips
                      `}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}

              {/* Animations Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Animated Examples
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Watch step-by-step animated solutions to understand concepts better
                  </Typography>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Card variant="outlined">
                          <Box
                            sx={{
                              height: 150,
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 48, color: 'primary.main' }} />
                          </Box>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Example {i}: Problem Solving
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              2:30 minutes
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Audio Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Audio Lecture
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Listen to the full audio narration of this lesson
                  </Typography>
                  <Card variant="outlined" sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <Headphones fontSize="large" />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {lesson.title} - Audio Lecture
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Duration: 18 minutes
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={30} sx={{ mb: 1, height: 6, borderRadius: 3 }} />
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                      <IconButton>
                        <SkipPrevious />
                      </IconButton>
                      <IconButton color="primary" size="large">
                        <PlayArrow fontSize="large" />
                      </IconButton>
                      <IconButton>
                        <SkipNext />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              )}

              {/* Practice Tab */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Practice Questions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Test your understanding with these practice questions
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Quiz />}
                    onClick={() => navigate('/education/practice')}
                  >
                    Start Practice Questions (15 available)
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3} mb={2}>
            <Button
              variant="outlined"
              startIcon={<SkipPrevious />}
              onClick={handlePreviousLesson}
            >
              Previous Lesson
            </Button>
            <Button
              variant="contained"
              endIcon={<SkipNext />}
              onClick={handleNextLesson}
            >
              Next Lesson
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LessonViewer;
