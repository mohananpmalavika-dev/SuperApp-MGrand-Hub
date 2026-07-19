import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AutoAwesome as AIIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllCourses,
  deleteCourse,
  generateContent,
  clearAdminError,
} from '../../store/slices/adminSlice';

const ContentManagement = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.admin);

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [contentForm, setContentForm] = useState({
    track: 'CA Foundation',
    subject: '',
    topic: '',
    lessonCount: 1,
  });

  useEffect(() => {
    dispatch(fetchAllCourses({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleGenerateContent = async () => {
    setGenerating(true);
    try {
      await dispatch(generateContent(contentForm)).unwrap();
      setGenerateDialogOpen(false);
      alert('Content generation started! This may take a few minutes.');
      dispatch(fetchAllCourses({ page: 1, limit: 50 }));
    } catch (error) {
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (selectedCourse) {
      try {
        await dispatch(deleteCourse(selectedCourse._id)).unwrap();
        setDeleteDialogOpen(false);
        setSelectedCourse(null);
        alert('Course deleted successfully');
      } catch (error) {
        alert('Failed to delete course');
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'CA Foundation': 'primary',
      'CA Intermediate': 'secondary',
      'CA Final': 'success',
      'IAS Prelims': 'info',
      'IAS Mains': 'warning',
      'JEE Main': 'error',
      'JEE Advanced': 'default',
    };
    return colors[category] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage courses and generate AI-powered content
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AIIcon />}
          onClick={() => setGenerateDialogOpen(true)}
        >
          Generate Content
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearAdminError())}>
          {error}
        </Alert>
      )}

      {/* Courses Grid */}
      {loading && courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading courses...
          </Typography>
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate your first course using AI
          </Typography>
          <Button
            variant="contained"
            startIcon={<AIIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Generate Content
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id || course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={course.category || 'General'}
                      color={getCategoryColor(course.category)}
                      size="small"
                    />
                    <Chip
                      label={course.isPublished ? 'Published' : 'Draft'}
                      color={course.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {course.title || 'Untitled Course'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description?.substring(0, 100) || 'No description'}
                    {course.description?.length > 100 && '...'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Lessons
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {course.lessonCount || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Enrolled
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {course.enrolledStudents || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {course.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Completion</Typography>
                        <Typography variant="caption">{course.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={course.progress} />
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size="small" startIcon={<ViewIcon />}>
                    View
                  </Button>
                  <Box>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedCourse(course);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Generate Content Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => !generating && setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate AI-Powered Content</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Track"
              fullWidth
              select
              value={contentForm.track}
              onChange={(e) => setContentForm({ ...contentForm, track: e.target.value })}
              disabled={generating}
            >
              <MenuItem value="CA Foundation">CA Foundation</MenuItem>
              <MenuItem value="CA Intermediate">CA Intermediate</MenuItem>
              <MenuItem value="CA Final">CA Final</MenuItem>
              <MenuItem value="IAS Prelims">IAS Prelims</MenuItem>
              <MenuItem value="IAS Mains">IAS Mains</MenuItem>
              <MenuItem value="JEE Main">JEE Main</MenuItem>
              <MenuItem value="JEE Advanced">JEE Advanced</MenuItem>
              <MenuItem value="CBSE Class 10">CBSE Class 10</MenuItem>
              <MenuItem value="CBSE Class 12">CBSE Class 12</MenuItem>
            </TextField>

            <TextField
              label="Subject"
              fullWidth
              value={contentForm.subject}
              onChange={(e) => setContentForm({ ...contentForm, subject: e.target.value })}
              disabled={generating}
              placeholder="e.g., Financial Accounting, Physics, History"
            />

            <TextField
              label="Topic"
              fullWidth
              multiline
              rows={2}
              value={contentForm.topic}
              onChange={(e) => setContentForm({ ...contentForm, topic: e.target.value })}
              disabled={generating}
              placeholder="e.g., Introduction to Double Entry System"
            />

            <TextField
              label="Number of Lessons"
              fullWidth
              type="number"
              value={contentForm.lessonCount}
              onChange={(e) =>
                setContentForm({ ...contentForm, lessonCount: parseInt(e.target.value) })
              }
              disabled={generating}
              inputProps={{ min: 1, max: 20 }}
            />

            <Alert severity="info">
              <Typography variant="body2">
                AI will generate comprehensive content including:
              </Typography>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Detailed lesson content (2000-3000 words)</li>
                <li>Audio lectures (15-20 minutes)</li>
                <li>Video lessons with slides</li>
                <li>Animated problem-solving examples</li>
                <li>Practice questions (10-20 MCQs)</li>
              </ul>
            </Alert>

            {generating && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Generating content... This may take a few minutes.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateContent}
            disabled={
              generating ||
              !contentForm.subject ||
              !contentForm.topic ||
              contentForm.lessonCount < 1
            }
            startIcon={generating ? <CircularProgress size={16} /> : <AIIcon />}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Course?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this course?
          </Alert>
          <Typography variant="body2">
            This will permanently delete <strong>{selectedCourse?.title}</strong> and all its
            lessons, questions, and related content. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteCourse}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContentManagement;
