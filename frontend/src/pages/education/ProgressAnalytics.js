import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  LocalFireDepartment,
  MenuBook,
  Quiz,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProgressAnalytics = () => {
  const weeklyData = [
    { day: 'Mon', hours: 2.5, score: 75 },
    { day: 'Tue', hours: 3.2, score: 80 },
    { day: 'Wed', hours: 1.8, score: 70 },
    { day: 'Thu', hours: 4.1, score: 85 },
    { day: 'Fri', hours: 2.9, score: 78 },
    { day: 'Sat', hours: 5.5, score: 90 },
    { day: 'Sun', hours: 4.2, score: 88 },
  ];

  const subjectMastery = [
    { subject: 'Accounting', mastery: 75 },
    { subject: 'Mathematics', mastery: 60 },
    { subject: 'Economics', mastery: 45 },
    { subject: 'Business Laws', mastery: 30 },
    { subject: 'Statistics', mastery: 50 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Progress Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <MenuBook color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">45</Typography>
              <Typography variant="body2" color="textSecondary">
                Lessons Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Quiz color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">320</Typography>
              <Typography variant="body2" color="textSecondary">
                Questions Attempted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">12</Typography>
              <Typography variant="body2" color="textSecondary">
                Tests Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <LocalFireDepartment sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h4">15</Typography>
              <Typography variant="body2" color="textSecondary">
                Day Streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Weekly Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hours" stroke="#2196f3" name="Study Hours" />
                  <Line type="monotone" dataKey="score" stroke="#4caf50" name="Avg Score %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Subject Mastery
              </Typography>
              {subjectMastery.map((subject) => (
                <Box key={subject.subject} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{subject.subject}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {subject.mastery}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={subject.mastery}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProgressAnalytics;
