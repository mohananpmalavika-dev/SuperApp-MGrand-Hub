import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { AccessTime, ExpandMore, PlayCircleOutline } from '@mui/icons-material';
import { getCAFoundationCourse } from '../../services/caFoundationService';

const CAFoundationCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setCourse(null);
    setError('');
    getCAFoundationCourse(courseId)
      .then(setCourse)
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'This course could not be loaded.');
      });
  }, [courseId]);

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!course) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component="button" underline="hover" onClick={() => navigate('/education/ca-foundation')}>
          CA Foundation
        </Link>
        <Typography color="text.primary">{course.subject}</Typography>
      </Breadcrumbs>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        {course.title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 850, mb: 2 }}>
        {course.description}
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 4 }}>
        <Chip label={`${course.lessons.length} lessons`} color="primary" />
        <Chip label={`${Math.round(course.duration / 60)} hours`} icon={<AccessTime />} />
        <Chip label={course.source === 'google-drive' ? 'Live from Google Drive' : 'Course content ready'} />
      </Box>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Course lessons
      </Typography>
      {course.modules.map((module, moduleIndex) => (
        <Accordion key={module.moduleNumber} defaultExpanded={moduleIndex === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight="bold">
              {module.title} · {module.lessons.length} lessons
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List disablePadding>
              {module.lessons.map((lesson) => (
                <ListItemButton
                  divider
                  key={lesson.lessonIndex}
                  onClick={() =>
                    navigate(`/education/ca-foundation/${course.id}/lesson/${lesson.lessonIndex}`)
                  }
                >
                  <PlayCircleOutline color="primary" sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`${lesson.chapterNumber || lesson.lessonIndex + 1}. ${lesson.topic}`}
                    secondary={`${lesson.duration || 45} minutes`}
                  />
                  <Button size="small">Study</Button>
                </ListItemButton>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default CAFoundationCourse;
