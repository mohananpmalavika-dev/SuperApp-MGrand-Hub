import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, Lightbulb, Warning } from '@mui/icons-material';
import { getCAFoundationLesson } from '../../services/caFoundationService';

const MarkdownBlock = ({ children }) => (
  <Box sx={{ '& p': { lineHeight: 1.75 }, '& li': { mb: 0.75 } }}>
    <ReactMarkdown>{children || ''}</ReactMarkdown>
  </Box>
);

const CAFoundationLesson = () => {
  const { courseId, lessonIndex } = useParams();
  const navigate = useNavigate();
  const index = Number(lessonIndex);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLesson(null);
    setError('');
    getCAFoundationLesson(courseId, index)
      .then(setLesson)
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'This lesson could not be loaded.');
      });
  }, [courseId, index]);

  const goToLesson = (nextIndex) => {
    navigate(`/education/ca-foundation/${courseId}/lesson/${nextIndex}`);
  };

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!lesson) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component="button" underline="hover" onClick={() => navigate('/education/ca-foundation')}>
          CA Foundation
        </Link>
        <Link component="button" underline="hover" onClick={() => navigate(`/education/ca-foundation/${courseId}`)}>
          {lesson.subject}
        </Link>
        <Typography color="text.primary">Lesson {index + 1}</Typography>
      </Breadcrumbs>

      <Chip label={`${lesson.duration || 45} minutes`} color="primary" sx={{ mb: 2 }} />
      <Typography variant="h3" fontWeight="bold" gutterBottom>{lesson.topic}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>{lesson.subject} · CA Foundation</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Introduction</Typography>
              <MarkdownBlock>{lesson.introduction}</MarkdownBlock>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>Detailed lesson</Typography>
              <MarkdownBlock>{lesson.detailedContent}</MarkdownBlock>
            </CardContent>
          </Card>

          {lesson.solvedExamples?.map((example, exampleIndex) => (
            <Card sx={{ mb: 3 }} key={example._id || exampleIndex}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Solved example {exampleIndex + 1}
                </Typography>
                <Typography fontWeight="bold" sx={{ mb: 2 }}>{example.question}</Typography>
                <MarkdownBlock>{example.solution}</MarkdownBlock>
                {example.keyTakeaway && <Alert severity="success">{example.keyTakeaway}</Alert>}
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <Lightbulb color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Key concepts
              </Typography>
              {lesson.keyConcepts?.map((concept, conceptIndex) => (
                <Box key={concept._id || conceptIndex} sx={{ mb: 2 }}>
                  <Typography fontWeight="bold">{concept.concept}</Typography>
                  <Typography variant="body2" color="text.secondary">{concept.definition}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                <CheckCircle color="success" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Quick revision
              </Typography>
              <List dense>
                {lesson.quickRevision?.summary?.map((item, itemIndex) => (
                  <ListItem key={itemIndex}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                <Warning color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Exam tips
              </Typography>
              <List dense>
                {lesson.examTips?.map((tip, tipIndex) => (
                  <ListItem key={tipIndex}><ListItemText primary={tip} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          disabled={!lesson.navigation?.hasPrevious}
          onClick={() => goToLesson(index - 1)}
        >
          Previous lesson
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          disabled={!lesson.navigation?.hasNext}
          onClick={() => goToLesson(index + 1)}
        >
          Next lesson
        </Button>
      </Box>
    </Container>
  );
};

export default CAFoundationLesson;
