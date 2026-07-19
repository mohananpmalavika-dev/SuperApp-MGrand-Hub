import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { Assessment, Timer, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TestInterface = () => {
  const navigate = useNavigate();

  const tests = [
    { id: 1, title: 'Chapter 1 Test', questions: 20, duration: 30, difficulty: 'Easy' },
    { id: 2, title: 'Chapter 2 Test', questions: 25, duration: 40, difficulty: 'Medium' },
    { id: 3, title: 'Full Mock Test', questions: 50, duration: 90, difficulty: 'Hard' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Tests & Mock Exams
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Test your knowledge with chapter tests and full mock exams
      </Typography>

      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} md={4} key={test.id}>
            <Card>
              <CardContent>
                <Assessment color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {test.title}
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {test.questions} Questions
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {test.duration} mins
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/education/test/${test.id}/results`)}
                >
                  Start Test
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TestInterface;
