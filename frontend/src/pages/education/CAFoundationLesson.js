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
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Headphones,
  Lightbulb,
  MenuBook,
  Quiz,
  SmartToy,
  VideoLibrary,
  Warning,
} from '@mui/icons-material';
import { getCAFoundationLesson } from '../../services/caFoundationService';
import LessonAudioPlayer from '../../components/education/LessonAudioPlayer';
import GuidedLessonVideo from '../../components/education/GuidedLessonVideo';
import LessonTutor from '../../components/education/LessonTutor';

const MarkdownBlock = ({ children }) => (
  <Box
    sx={{
      '& p': { lineHeight: 1.8 },
      '& li': { mb: 0.75, lineHeight: 1.7 },
      '& h2': { mt: 3 },
      '& h3': { mt: 2.5 },
    }}
  >
    <ReactMarkdown>{children || ''}</ReactMarkdown>
  </Box>
);

const PracticePanel = ({ lesson }) => {
  const [revealed, setRevealed] = useState({});

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Attempt each question without notes. Reveal the answer guide only after writing or speaking
        your complete response.
      </Alert>
      {lesson.practiceProblems?.map((problem, index) => (
        <Card key={problem.id || index} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
              <Chip size="small" label={problem.difficulty} />
              <Chip size="small" label={problem.type} variant="outlined" />
              <Chip size="small" label={`${problem.marks} mark${problem.marks === 1 ? '' : 's'}`} />
            </Box>
            <Typography variant="h6">{problem.question}</Typography>
            <Button
              sx={{ mt: 2 }}
              onClick={() =>
                setRevealed((current) => ({ ...current, [index]: !current[index] }))
              }
            >
              {revealed[index] ? 'Hide answer guide' : 'Reveal answer guide'}
            </Button>
            {revealed[index] && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <List dense>
                  {problem.answerGuide?.map((line) => (
                    <ListItem key={line} disableGutters>
                      <ListItemText primary={line} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const TextLesson = ({ lesson }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Chapter orientation
          </Typography>
          <MarkdownBlock>{lesson.introduction}</MarkdownBlock>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Masterclass notes
          </Typography>
          <MarkdownBlock>{lesson.detailedContent}</MarkdownBlock>
        </CardContent>
      </Card>

      {lesson.solvedExamples?.map((example, exampleIndex) => (
        <Card sx={{ mb: 3 }} key={example._id || exampleIndex}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Worked reasoning {exampleIndex + 1}
            </Typography>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              {example.question}
            </Typography>
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
            Mastery map
          </Typography>
          {lesson.keyConcepts?.map((concept, conceptIndex) => (
            <Box key={concept._id || conceptIndex} sx={{ mb: 2.5 }}>
              <Typography fontWeight="bold">{concept.concept}</Typography>
              <Typography variant="body2" color="text.secondary">
                {concept.explanation}
              </Typography>
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
            {lesson.quickRevision?.summary?.map((item) => (
              <ListItem key={item}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            <Warning color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Exam discipline
          </Typography>
          <List dense>
            {lesson.examTips?.map((tip) => (
              <ListItem key={tip}>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

const CAFoundationLesson = () => {
  const { courseId, lessonIndex } = useParams();
  const navigate = useNavigate();
  const index = Number(lessonIndex);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    setLesson(null);
    setError('');
    setTab(0);
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
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const tabs = [
    { label: 'Read', icon: <MenuBook />, content: <TextLesson lesson={lesson} /> },
    {
      label: 'Listen',
      icon: <Headphones />,
      content: <LessonAudioPlayer audio={lesson.audio} topic={lesson.topic} />,
    },
    {
      label: 'Visual class',
      icon: <VideoLibrary />,
      content: <GuidedLessonVideo video={lesson.video} topic={lesson.topic} />,
    },
    { label: 'Practice', icon: <Quiz />, content: <PracticePanel lesson={lesson} /> },
    {
      label: 'Ask tutor',
      icon: <SmartToy />,
      content: (
        <LessonTutor
          courseId={courseId}
          lessonIndex={index}
          topic={lesson.topic}
        />
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate('/education/ca-foundation')}
        >
          CA Foundation
        </Link>
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate(`/education/ca-foundation/${courseId}`)}
        >
          {lesson.subject}
        </Link>
        <Typography color="text.primary">Chapter {lesson.chapterNumber}</Typography>
      </Breadcrumbs>

      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
        <Chip label={`Paper ${lesson.paper}`} color="secondary" />
        <Chip label={`${lesson.duration || 75} minutes`} color="primary" />
        <Chip label={lesson.examMode} variant="outlined" />
        <Chip label="Drive lesson" variant="outlined" />
      </Box>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        {lesson.topic}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {lesson.subject} · {lesson.moduleTitle} · CA Foundation
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {lesson.source?.disclaimer}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((item) => (
            <Tab key={item.label} icon={item.icon} iconPosition="start" label={item.label} />
          ))}
        </Tabs>
      </Box>

      {tabs[tab].content}

      <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          disabled={index === 0}
          onClick={() => goToLesson(index - 1)}
        >
          Previous chapter
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          disabled={!lesson.navigation?.hasNext}
          onClick={() => goToLesson(index + 1)}
        >
          Next chapter
        </Button>
      </Box>
    </Container>
  );
};

export default CAFoundationLesson;
