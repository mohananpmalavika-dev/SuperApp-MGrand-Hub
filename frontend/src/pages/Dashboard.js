import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  Notifications,
  Person,
  Restaurant,
  Category,
  Business,
  Chat,
  Star,
  AccountBalance,
  ExitToApp,
  Menu as MenuIcon,
  School,
  Description,
  Message,
} from '@mui/icons-material';
import './Dashboard.css';

const modules = [
  {
    id: 'tutor',
    name: 'Personal Tutor',
    description: 'AI-powered learning with voice and video features',
    icon: <School sx={{ fontSize: 48 }} />,
    color: '#667eea',
    status: 'Active',
    path: '/tutor/dashboard',
  },
  {
    id: 'resume',
    name: 'Resume Builder',
    description: 'Create professional resumes with PDF/DOCX export',
    icon: <Description sx={{ fontSize: 48 }} />,
    color: '#764ba2',
    status: 'Active',
    path: '/resume',
  },
  {
    id: 'messaging',
    name: 'Messages',
    description: 'Chat, voice & video calls with end-to-end encryption',
    icon: <Message sx={{ fontSize: 48 }} />,
    color: '#00C9A7',
    status: 'Active',
    path: '/messaging',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Browse products, add to cart, and shop online',
    icon: <ShoppingCart sx={{ fontSize: 48 }} />,
    color: '#FF6B6B',
    status: 'Coming Soon',
    path: '/ecommerce',
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'View transactions, make payments, manage refunds',
    icon: <Payment sx={{ fontSize: 48 }} />,
    color: '#4ECDC4',
    status: 'Active',
    path: '/payments',
  },
  {
    id: 'profile',
    name: 'My Profile',
    description: 'Manage your profile and preferences',
    icon: <Person sx={{ fontSize: 48 }} />,
    color: '#95E1D3',
    status: 'Active',
    path: '/profile',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'View all your notifications',
    icon: <Notifications sx={{ fontSize: 48 }} />,
    color: '#F38181',
    status: 'Active',
    path: '/notifications',
  },
  {
    id: 'food',
    name: 'Food Delivery',
    description: 'Order food from your favorite restaurants',
    icon: <Restaurant sx={{ fontSize: 48 }} />,
    color: '#FFA07A',
    status: 'Coming Soon',
    path: '/food-delivery',
  },
  {
    id: 'classifieds',
    name: 'Classifieds',
    description: 'Buy and sell items, post listings',
    icon: <Category sx={{ fontSize: 48 }} />,
    color: '#98D8C8',
    status: 'Coming Soon',
    path: '/classifieds',
  },
  {
    id: 'business',
    name: 'Business Hub',
    description: 'Business services and freelancing',
    icon: <Business sx={{ fontSize: 48 }} />,
    color: '#A8E6CF',
    status: 'Coming Soon',
    path: '/business',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Connect with friends, social networking',
    icon: <Chat sx={{ fontSize: 48 }} />,
    color: '#FFD3B6',
    status: 'Coming Soon',
    path: '/social',
  },
  {
    id: 'ai',
    name: 'AI Services',
    description: 'AI chat, beauty AI, astrology',
    icon: <Star sx={{ fontSize: 48 }} />,
    color: '#FFAAA5',
    status: 'Coming Soon',
    path: '/ai',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Loans, banking, financial services',
    icon: <AccountBalance sx={{ fontSize: 48 }} />,
    color: '#B4E7CE',
    status: 'Coming Soon',
    path: '/finance',
  },
];

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/');
  };

  const handleModuleClick = (module) => {
    if (module.status === 'Active') {
      navigate(module.path);
    }
  };

  return (
    <div className="dashboard-page">
      {/* App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 MGrand Hub
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: '#764ba2' }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <Person sx={{ mr: 1 }} /> My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/notifications'); }}>
              <Notifications sx={{ mr: 1 }} /> Notifications
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access all your services in one place
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Active Services</Typography>
                <Typography variant="h3">7</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#764ba2', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Coming Soon</Typography>
                <Typography variant="h3">6</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4ECDC4', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Notifications</Typography>
                <Typography variant="h3">0</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#F38181', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Profile</Typography>
                <Typography variant="h3">100%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Modules Grid */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Your Services
        </Typography>

        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <Card
                className="module-card"
                sx={{
                  height: '100%',
                  cursor: module.status === 'Active' ? 'pointer' : 'not-allowed',
                  opacity: module.status === 'Active' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: module.status === 'Active' ? 'translateY(-8px)' : 'none',
                    boxShadow: module.status === 'Active' ? '0 12px 40px rgba(0,0,0,0.2)' : 'none',
                  },
                }}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: module.color, mb: 2 }}>
                    {module.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {module.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Chip
                    label={module.status}
                    size="small"
                    color={module.status === 'Active' ? 'success' : 'default'}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Dashboard;
