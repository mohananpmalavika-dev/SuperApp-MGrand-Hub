import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { CheckCircle, Cancel, TrendingUp } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const TestResults = () => {
  const navigate = useNavigate();
  const data = [
    { name: 'Correct', value: 35, color: '#4caf50' },
    { name: 'Incorrect', value: 10, color: '#f44336' },
    { name: 'Unattempted', value: 5, color: '#9e9e9e' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Test Results
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="primary" gutterBottom>
                70%
              </Typography>
              <Typography variant="body1">Your Score</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" gutterBottom>
                35/50
              </Typography>
              <Typography variant="body1">Correct Answers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" gutterBottom>
                45 min
              </Typography>
              <Typography variant="body1">Time Taken</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" onClick={() => navigate('/education/tests')}>
          Take Another Test
        </Button>
        <Button variant="outlined" onClick={() => navigate('/education/progress')}>
          View Detailed Analysis
        </Button>
      </Box>
    </Container>
  );
};

export default TestResults;
