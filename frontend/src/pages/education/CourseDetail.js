import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore,
  School,
  MenuBook,
  AccessTime,
  Star,
  PlayCircleOutline,
  CheckCircle,
  Lock,
  OndemandVideo,
  Headphones,
  Quiz,
  Description,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { fetchCourseById, enrollCourse } from '../../store/slices/educationSlice';

const CourseDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { currentCourse, loading, error } = useSelector((state) => state.education);
  const [expandedModule, setExpandedModule] = useState(0);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }
  }, [dispatch, courseId]);

  const handleModuleChange = (moduleIndex) => (event, isExpanded) => {
    setExpandedModule(isExpanded ? moduleIndex : false);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await dispatch(enrollCourse(courseId)).unwrap();
      setEnrollSuccess(true);
      // Refresh course data
      dispatch(fetchCourseById(courseId));
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/education/lesson/${lessonId}`);
  };

  if (loading || !currentCourse) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LinearProgress />
        <Box textAlign="center" py={4}>
          <Typography>Loading course details...</Typography>
        </Box>
      </Container>
    );
  }

  const course = currentCourse;

  const curriculum = course.curriculum || { modules: [] };
  const curriculumLessons = curriculum.modules.reduce(
    (total, module) => total + (module.chapters?.length || 0),
    0
  );
  const totalLessons = course.totalLessons ?? curriculumLessons;
  const estimatedHours = course.estimatedHours;
  const features = [
    course.videoCount > 0 && { icon: <OndemandVideo />, text: 'Video lectures', value: `${course.videoCount} videos` },
    course.audioCount > 0 && { icon: <Headphones />, text: 'Audio lessons', value: `${course.audioCount} recordings` },
    course.studyMaterialCount > 0 && { icon: <Description />, text: 'Study material', value: `${course.studyMaterialCount} resources` },
    course.practiceQuestionCount > 0 && { icon: <Quiz />, text: 'Practice questions', value: `${course.practiceQuestionCount} questions` },
    course.mockTestCount > 0 && { icon: <MenuBook />, text: 'Mock tests', value: `${course.mockTestCount} tests` },
    course.progressTracking && { icon: <TrendingUp />, text: 'Progress tracking', value: 'Enabled' },
  ].filter(Boolean);
  const learningOutcomes = course.learningOutcomes || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Course Header */}
          <Card sx={{ mb: 3 }}>
            <Box
              sx={{
                height: 200,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ fontSize: 100, color: 'white' }} />
            </Box>
            <CardContent>
              <Box display="flex" gap={1} mb={2}>
                <Chip label={course.category} color="primary" />
                <Chip label={course.difficulty} color="secondary" />
              </Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {course.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {course.description || 'A description has not been added for this course yet.'}
              </Typography>
              <Box display="flex" alignItems="center" gap={3} mt={3}>
                {course.rating != null && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Star sx={{ color: '#ffc107' }} />
                    <Typography variant="body1">
                      <strong>{course.rating}</strong> ({course.enrolledCount ?? 0} students)
                    </Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={1}>
                  <MenuBook color="action" />
                  <Typography variant="body1">
                    {totalLessons} Lessons
                  </Typography>
                </Box>
                {estimatedHours != null && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime color="action" />
                    <Typography variant="body1">{estimatedHours} Hours</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* What You'll Learn */}
          {learningOutcomes.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  What You'll Learn
                </Typography>
                <Grid container spacing={2} mt={1}>
                  {learningOutcomes.map((outcome, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <CheckCircle color="success" fontSize="small" sx={{ mt: 0.5 }} />
                        <Typography variant="body2">{outcome}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Course Content */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Course Content
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                {curriculum.modules.length} modules • {totalLessons} lessons
                {estimatedHours != null ? ` • ${estimatedHours}h total` : ''}
              </Typography>

              {curriculum.modules.length === 0 && (
                <Alert severity="info">
                  The curriculum has not been published for this course yet.
                </Alert>
              )}

              {curriculum.modules.map((module, moduleIndex) => (
                <Accordion
                  key={moduleIndex}
                  expanded={expandedModule === moduleIndex}
                  onChange={handleModuleChange(moduleIndex)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Typography variant="subtitle1" fontWeight="bold" flex={1}>
                        Module {module.moduleNumber}: {module.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mr={2}>
                        {module.chapters?.length || 0} lessons
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {module.description}
                    </Typography>
                    <List dense>
                      {module.chapters?.map((chapter, chapterIndex) => (
                        <ListItemButton
                          key={chapterIndex}
                          disabled={!course.isEnrolled}
                          onClick={() => handleStartLesson(chapter._id || `lesson-${moduleIndex}-${chapterIndex}`)}
                        >
                          <ListItemIcon>
                            {chapter.completed ? (
                              <CheckCircle color="success" />
                            ) : course.isEnrolled ? (
                              <PlayCircleOutline />
                            ) : (
                              <Lock color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={chapter.title}
                            secondary={chapter.duration}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Course Features
              </Typography>
              <Grid container spacing={2} mt={1}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {feature.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{feature.text}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {feature.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
                {features.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">No course features have been published yet.</Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              {course.isEnrolled ? (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You're enrolled in this course!
                  </Alert>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayCircleOutline />}
                    onClick={() => handleStartLesson('first-lesson')}
                    sx={{ mb: 2 }}
                  >
                    Continue Learning
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/education/progress')}
                  >
                    View Progress
                  </Button>
                </>
              ) : (
                <>
                  <Box textAlign="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                      {course.price != null
                        ? new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: course.currency || 'INR',
                            maximumFractionDigits: 0,
                          }).format(course.price)
                        : 'Enrollment available'}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    sx={{ mb: 2 }}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                  {course.moneyBackGuaranteeDays > 0 && (
                    <Typography variant="caption" color="textSecondary" textAlign="center" display="block">
                      {course.moneyBackGuaranteeDays}-day money-back guarantee
                    </Typography>
                  )}
                </>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                This course includes:
              </Typography>
              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.text}
                      secondary={feature.value}
                    />
                  </ListItem>
                ))}
              </List>
              {features.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Feature details have not been published yet.
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Box textAlign="center">
                <EmojiEvents sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Certificate of Completion
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Earn a certificate after completing the course
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enrollment Success Snackbar */}
      <Snackbar
        open={enrollSuccess}
        autoHideDuration={6000}
        onClose={() => setEnrollSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setEnrollSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Successfully enrolled! You can now start learning.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseDetail;
