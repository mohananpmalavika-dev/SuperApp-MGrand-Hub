import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  School,
  MenuBook,
  Quiz,
  Assessment,
  TrendingUp,
  LocalFireDepartment,
  PlayArrow,
  EmojiEvents,
} from '@mui/icons-material';
import { fetchEnrolledCourses } from '../../store/slices/educationSlice';
import { fetchProgress } from '../../store/slices/progressSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon: Icon, title, value, subtitle, color, action }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: color || 'primary.main',
            width: 56,
            height: 56,
          }}
        >
          <Icon fontSize="large" />
        </Avatar>
      </Box>
      {action}
    </CardContent>
  </Card>
);

const CourseProgressCard = ({ course, onContinue }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flex={1}>
          <Typography variant="h6" gutterBottom>
            {course.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Chip
              label={course.category}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={course.difficulty}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {course.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={course.progress || 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary" mt={1} display="block">
              {course.completedLessons || 0} of {course.totalLessons || 0} lessons completed
            </Typography>
          </Box>
        </Box>
        <IconButton
          color="primary"
          onClick={() => onContinue(course._id)}
          sx={{ ml: 2 }}
        >
          <PlayArrow fontSize="large" />
        </IconButton>
      </Box>
    </CardContent>
  </Card>
);

const EducationDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enrolledCourses, loading } = useSelector((state) => state.education);
  const { stats, userProgress } = useSelector((state) => state.progress);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
    dispatch(fetchProgress());
  }, [dispatch]);

  const handleContinueCourse = (courseId) => {
    navigate(`/education/course/${courseId}`);
  };

  const handleBrowseCourses = () => {
    navigate('/education/courses');
  };

  const handleStartTest = () => {
    navigate('/education/tests');
  };

  const handleViewProgress = () => {
    navigate('/education/progress');
  };

  const weeklyProgress = stats.weeklyProgress || userProgress?.weeklyProgress || [];
  const subjectProgress = stats.subjectProgress || userProgress?.subjectProgress || [];
  const nextAchievement = stats.nextAchievement || userProgress?.nextAchievement;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Continue your learning journey
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={School}
            title="Enrolled Courses"
            value={stats.coursesEnrolled || enrolledCourses.length}
            subtitle="Active learning"
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MenuBook}
            title="Lessons Completed"
            value={stats.lessonsCompleted || 0}
            subtitle="Keep going!"
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Quiz}
            title="Questions Attempted"
            value={stats.questionsAttempted || 0}
            subtitle="Practice makes perfect"
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={LocalFireDepartment}
            title="Current Streak"
            value={`${stats.currentStreak || 0} days`}
            subtitle="🔥 On fire!"
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Continue Learning */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Continue Learning
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleBrowseCourses}
                >
                  Browse All Courses
                </Button>
              </Box>

              {loading ? (
                <LinearProgress />
              ) : enrolledCourses.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No enrolled courses yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Start your learning journey by enrolling in a course
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleBrowseCourses}
                    startIcon={<School />}
                  >
                    Browse Courses
                  </Button>
                </Box>
              ) : (
                <Box>
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <CourseProgressCard
                      key={course._id}
                      course={course}
                      onContinue={handleContinueCourse}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Weekly Study Time
              </Typography>
              {weeklyProgress.length > 0 ? (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#2196f3" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <Typography color="text.secondary">
                    Your study-time chart will appear after you complete lessons.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Quick Actions & Stats */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={handleStartTest}
                  size="large"
                >
                  Take a Test
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={handleViewProgress}
                  size="large"
                >
                  View Progress
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<School />}
                  onClick={() => navigate('/education/tutor')}
                  size="large"
                >
                  Ask AI Tutor
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Subject Progress
              </Typography>
              <Box mt={2}>
                {subjectProgress.map((subject, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{subject.subject}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {subject.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={subject.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
                {subjectProgress.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No subject progress recorded yet.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Achievement */}
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box textAlign="center">
                <EmojiEvents sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {nextAchievement?.title || 'Start learning'}
                </Typography>
                <Typography variant="body2" mb={2}>
                  {nextAchievement?.description || 'Open CA Foundation and complete your first real lesson.'}
                </Typography>
                {nextAchievement?.progress != null ? (
                  <LinearProgress
                    variant="determinate"
                    value={nextAchievement.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                    }}
                  />
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/education/ca-foundation')}
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    Open CA Foundation
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EducationDashboard;
