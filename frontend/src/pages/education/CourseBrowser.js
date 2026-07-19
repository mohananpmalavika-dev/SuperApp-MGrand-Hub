import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  GridView,
  ViewList,
  School,
  MenuBook,
  AccessTime,
  Star,
  PlayArrow,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { fetchCourses, setFilters } from '../../store/slices/educationSlice';

const categories = [
  { value: '', label: 'All Courses' },
  { value: 'professional', label: 'CA (Chartered Accountancy)' },
  { value: 'civil_services', label: 'IAS (Civil Services)' },
  { value: 'engineering_entrance', label: 'JEE (Engineering)' },
  { value: 'school', label: 'School (Class 5-12)' },
];

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
  expert: 'error',
};

const CourseCard = ({ course, view, onEnroll, onViewDetails }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  if (view === 'list') {
    return (
      <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => onViewDetails(course._id)}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                  }}
                >
                  <School fontSize="large" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>
                    {course.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {course.description || 'Comprehensive course with AI-generated content'}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={course.category} size="small" color="primary" variant="outlined" />
                    <Chip
                      label={course.difficulty}
                      size="small"
                      color={difficultyColors[course.difficulty] || 'default'}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <MenuBook fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {course.totalLessons ?? 0} Lessons
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {course.estimatedHours ?? 0} Hours
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Star fontSize="small" sx={{ color: '#ffc107' }} />
                  <Typography variant="body2" color="textSecondary">
                    {course.rating != null ? `${course.rating} (${course.enrolledCount ?? 0} enrolled)` : 'Not yet rated'}
                  </Typography>
                </Box>
                {course.isEnrolled ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrow />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(course._id);
                    }}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnroll(course._id);
                    }}
                  >
                    Enroll Now
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: 140,
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <School sx={{ fontSize: 60, color: 'white' }} />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
          size="small"
          onClick={handleBookmark}
        >
          {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {course.name}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {course.description || 'Comprehensive course with AI-generated content, video lectures, and practice tests'}
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Chip label={course.category} size="small" color="primary" variant="outlined" />
          <Chip
            label={course.difficulty}
            size="small"
            color={difficultyColors[course.difficulty] || 'default'}
          />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <MenuBook fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {course.totalLessons ?? 0} Lessons
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {course.estimatedHours ?? 0}h
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Star fontSize="small" sx={{ color: '#ffc107' }} />
          <Typography variant="body2" color="textSecondary">
            {course.rating != null ? `${course.rating} • ${course.enrolledCount ?? 0} students` : 'Not yet rated'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        {course.isEnrolled ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => onViewDetails(course._id)}
          >
            Continue
          </Button>
        ) : (
          <>
            <Button fullWidth variant="outlined" onClick={() => onViewDetails(course._id)}>
              View Details
            </Button>
            <Button fullWidth variant="contained" onClick={() => onEnroll(course._id)}>
              Enroll
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

const CourseBrowser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading, filters } = useSelector((state) => state.education);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

  useEffect(() => {
    dispatch(fetchCourses({ category: selectedCategory, search: searchTerm }));
  }, [dispatch, selectedCategory, searchTerm]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    dispatch(setFilters({ category }));
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleEnroll = (courseId) => {
    // Enrollment will be handled in course detail page
    navigate(`/education/course/${courseId}`);
  };

  const handleViewDetails = (courseId) => {
    navigate(`/education/course/${courseId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Browse Courses
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Choose from our comprehensive collection of AI-powered courses
        </Typography>
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="grid">
                  <Tooltip title="Grid View">
                    <GridView />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list">
                  <Tooltip title="List View">
                    <ViewList />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Category Tabs */}
      <Box mb={3} sx={{ overflowX: 'auto' }}>
        <Box display="flex" gap={1}>
          {categories.map((category) => (
            <Chip
              key={category.value}
              label={category.label}
              onClick={() => handleCategoryChange(category.value)}
              color={selectedCategory === category.value ? 'primary' : 'default'}
              variant={selectedCategory === category.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Course Grid/List */}
      {courses.length === 0 && !loading ? (
        <Box textAlign="center" py={8}>
          <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your filters or search term
          </Typography>
        </Box>
      ) : view === 'grid' ? (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item key={course._id} xs={12} sm={6} md={4} lg={3}>
              <CourseCard
                course={course}
                view={view}
                onEnroll={handleEnroll}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              view={view}
              onEnroll={handleEnroll}
              onViewDetails={handleViewDetails}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default CourseBrowser;
