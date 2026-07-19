import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as LessonIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CardMembership as SubscriptionIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../../store/slices/adminSlice';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 32, color: `${color}.main` }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, subscriptions: 45 },
    { month: 'Feb', revenue: 52000, subscriptions: 52 },
    { month: 'Mar', revenue: 61000, subscriptions: 61 },
    { month: 'Apr', revenue: 73000, subscriptions: 73 },
    { month: 'May', revenue: 89000, subscriptions: 89 },
    { month: 'Jun', revenue: 105000, subscriptions: 105 },
    { month: 'Jul', revenue: 125000, subscriptions: 125 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 185 },
    { month: 'Mar', users: 247 },
    { month: 'Apr', users: 312 },
    { month: 'May', users: 398 },
    { month: 'Jun', users: 485 },
    { month: 'Jul', users: 567 },
  ];

  if (loading && !stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor platform performance and manage content
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={PeopleIcon}
            title="Total Users"
            value={stats.totalUsers.toLocaleString() || '567'}
            subtitle="+12% from last month"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={SubscriptionIcon}
            title="Active Subscriptions"
            value={stats.activeSubscriptions.toLocaleString() || '125'}
            subtitle="22% conversion rate"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={SchoolIcon}
            title="Total Courses"
            value={stats.totalCourses.toLocaleString() || '48'}
            subtitle="Across 4 tracks"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={LessonIcon}
            title="Total Lessons"
            value={stats.totalLessons.toLocaleString() || '1,234'}
            subtitle="AI-generated content"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={MoneyIcon}
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K` || '₹125K'}
            subtitle="All time"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="This Month"
            value={`₹${(stats.monthlyRevenue / 1000).toFixed(0)}K` || '₹23K'}
            subtitle="+18% from last month"
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue & Subscriptions
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#1976d2" name="Revenue (₹)" />
                <Bar yAxisId="right" dataKey="subscriptions" fill="#66bb6a" name="Subscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              User Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#f57c00"
                  strokeWidth={3}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Platform Insights
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    4,523
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lessons Completed Today
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    89%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Course Completion
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    2,145
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Tutor Conversations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    4.8/5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average User Rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
