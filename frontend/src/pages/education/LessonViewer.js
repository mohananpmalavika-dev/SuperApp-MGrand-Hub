import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import axios from 'axios';
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
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
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
  Download,
  PictureAsPdf,
  TextFields,
  Article,
} from '@mui/icons-material';
import { fetchLessonById } from '../../store/slices/educationSlice';
import { updateLessonProgress } from '../../store/slices/progressSlice';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3013/api/education';

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
  const [lessonData, setLessonData] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [downloadMenu, setDownloadMenu] = useState(null);
  const [downloading, setDownloading] = useState(false);
  
  const playerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Fetch lesson from Google Drive API
  useEffect(() => {
    async function fetchLesson() {
      try {
        setLoadingLesson(true);
        // Replace with your actual fileId and lessonIndex
        // These should come from your course structure
        const fileId = 'YOUR_DRIVE_FILE_ID'; // TODO: Get from course/module
        const lessonIndex = 0; // TODO: Calculate from lessonId
        
        const response = await axios.get(`${API_BASE}/drive/lesson/${fileId}/${lessonIndex}`);
        setLessonData(response.data.data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoadingLesson(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

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

  const handleDownloadNotes = async (format) => {
    try {
      setDownloading(true);
      setDownloadMenu(null);
      
      const fileId = 'YOUR_DRIVE_FILE_ID'; // TODO: Get from course
      const lessonIndex = 0; // TODO: Calculate from lessonId
      
      const response = await axios.get(
        `${API_BASE}/notes/download/${fileId}/${lessonIndex}?format=${format}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${lessonData?.topic || 'lesson'}-notes.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading notes:', error);
      alert('Error downloading notes. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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

  if (loadingLesson || !lessonData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography mt={2}>Loading lesson...</Typography>
        </Box>
      </Container>
    );
  }

  const lesson = lessonData;

  // Mock course structure for sidebar
  const courseStructure = [
    {
      moduleNumber: 1,
      title: 'Introduction',
      lessons: [
        { id: '1', title: 'Getting Started', duration: '15:00', completed: true },
        { id: '2', title: 'Key Concepts', duration: '20:00', completed: true },
        { id: lessonId, title: lesson.topic, duration: `${lesson.duration}:00`, completed: false },
      ],
    },
  ];

  const renderNotesContent = () => {
    if (!lesson) return null;

    return (
      <Box>
        {/* Introduction */}
        {lesson.introduction && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Introduction
            </Typography>
            <Typography paragraph sx={{ lineHeight: 1.8 }}>
              {lesson.introduction}
            </Typography>
          </Box>
        )}

        {/* Key Concepts */}
        {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Key Concepts
            </Typography>
            {lesson.keyConcepts.map((concept, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  {concept.concept}
                </Typography>
                {concept.definition && (
                  <Typography variant="body2" paragraph>
                    <strong>Definition:</strong> {concept.definition}
                  </Typography>
                )}
                {concept.explanation && (
                  <Typography variant="body2">
                    {concept.explanation}
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        )}

        {/* Detailed Content */}
        {lesson.detailedContent && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Detailed Explanation
            </Typography>
            <Typography paragraph sx={{ lineHeight: 1.8 }}>
              {lesson.detailedContent}
            </Typography>
          </Box>
        )}

        {/* Examples */}
        {(lesson.solvedExamples || lesson.practicalExamples) && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Examples
            </Typography>
            {(lesson.solvedExamples || lesson.practicalExamples).map((example, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Example {index + 1}: {example.question || example.title}
                </Typography>
                {example.solution && (
                  <Typography variant="body2" paragraph>
                    <strong>Solution:</strong> {example.solution}
                  </Typography>
                )}
                {example.keyTakeaway && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <strong>Key Takeaway:</strong> {example.keyTakeaway}
                  </Alert>
                )}
              </Card>
            ))}
          </Box>
        )}

        {/* Quick Revision */}
        {lesson.quickRevision && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Revision
            </Typography>
            {lesson.quickRevision.summary && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Summary Points:
                </Typography>
                <List dense>
                  {lesson.quickRevision.summary.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${point}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {lesson.quickRevision.formulas && lesson.quickRevision.formulas.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Key Formulas:
                </Typography>
                <List dense>
                  {lesson.quickRevision.formulas.map((formula, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`- ${formula}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Exam Tips */}
        {lesson.examTips && lesson.examTips.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Exam Tips 🎯
            </Typography>
            <List>
              {lesson.examTips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Summary */}
        {lesson.summary && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Summary
            </Typography>
            <Alert severity="success">
              {lesson.summary}
            </Alert>
          </Box>
        )}
      </Box>
    );
  };

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
                {lesson.topic || lesson.title}
              </Typography>
              <IconButton onClick={handleBookmark}>
                {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
              <IconButton
                onClick={(e) => setDownloadMenu(e.currentTarget)}
                disabled={downloading}
              >
                {downloading ? <CircularProgress size={24} /> : <Download />}
              </IconButton>
              <Menu
                anchorEl={downloadMenu}
                open={Boolean(downloadMenu)}
                onClose={() => setDownloadMenu(null)}
              >
                <MenuItem onClick={() => handleDownloadNotes('txt')}>
                  <ListItemIcon><TextFields /></ListItemIcon>
                  <ListItemText>Download TXT</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDownloadNotes('pdf')} disabled>
                  <ListItemIcon><PictureAsPdf /></ListItemIcon>
                  <ListItemText>Download PDF (Coming Soon)</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDownloadNotes('docx')} disabled>
                  <ListItemIcon><Article /></ListItemIcon>
                  <ListItemText>Download DOCX (Coming Soon)</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip label={lesson.subject || 'Subject'} size="small" />
              {lesson.duration && <Chip label={`${lesson.duration} minutes`} size="small" />}
              <Chip label={`${Math.round(progress)}% Complete`} size="small" color="primary" />
            </Box>
          </Box>

          {/* Video Player */}
          {lesson.videoUrl && (
            <Card sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
                <ReactPlayer
                  ref={playerRef}
                  url={lesson.videoUrl}
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
          )}

          {/* Content Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab icon={<Description />} label="Notes" iconPosition="start" />
                {lesson.audioUrl && <Tab icon={<Headphones />} label="Audio" iconPosition="start" />}
                <Tab icon={<Quiz />} label="Practice" iconPosition="start" />
              </Tabs>
            </Box>

            <CardContent>
              {/* Notes Tab */}
              {activeTab === 0 && renderNotesContent()}

              {/* Audio Tab */}
              {activeTab === 1 && lesson.audioUrl && (
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
                          {lesson.topic} - Audio Lecture
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Duration: {lesson.audioDuration || `${lesson.duration} minutes`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Voice: {lesson.audioVoice || 'Indian Female'}
                        </Typography>
                      </Box>
                    </Box>
                    <audio src={lesson.audioUrl} controls style={{ width: '100%' }} />
                  </Card>
                </Box>
              )}

              {/* Practice Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Practice Questions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Test your understanding with these practice questions
                  </Typography>
                  {lesson.practiceQuestionsCount > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {lesson.practiceQuestionsCount} practice questions available
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Quiz />}
                    onClick={() => navigate('/education/practice')}
                  >
                    Start Practice Questions
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
