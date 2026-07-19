import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { Calculate, Gavel, MenuBook, TrendingUp } from '@mui/icons-material';
import { getCAFoundationCourses } from '../../services/caFoundationService';

const subjectIcons = {
  Accounting: <MenuBook sx={{ fontSize: 52 }} />,
  'Business Economics': <TrendingUp sx={{ fontSize: 52 }} />,
  'Business Laws': <Gavel sx={{ fontSize: 52 }} />,
  'Business Mathematics': <Calculate sx={{ fontSize: 52 }} />,
};

const CAFoundationCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCAFoundationCourses()
      .then(setCourses)
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'CA Foundation courses are temporarily unavailable.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Chip label="ICAI Exam Preparation" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          CA Foundation
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
          Study all four CA Foundation subjects with structured lessons, solved examples,
          revision notes, practice problems, and exam tips.
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} lg={3} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  minHeight: 150,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                {subjectIcons[course.subject] || <MenuBook sx={{ fontSize: 52 }} />}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.description}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip size="small" label={`${course.totalLessons} lessons`} />
                  <Chip size="small" label={course.level} color="primary" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/education/ca-foundation/${course.id}`)}
                >
                  Open course
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CAFoundationCourses;
