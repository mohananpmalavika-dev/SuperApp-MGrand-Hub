import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Restaurant,
  Category,
  Business,
  Chat,
  Star,
  AccountBalance,
  Login,
  PersonAdd,
  Payment,
  Notifications,
  Person,
  School,
} from '@mui/icons-material';
import './LaunchPage.css';

const modules = [
  {
    id: 'ca-foundation',
    name: 'CA Foundation',
    description: 'Complete Accounting, Economics, Laws, and Mathematics courses',
    icon: <School sx={{ fontSize: 48 }} />,
    color: '#1976D2',
    status: 'Active',
    path: '/education/ca-foundation',
  },
  {
    id: 'tutor',
    name: 'Personal Tutor',
    description: 'AI-powered adaptive learning with quizzes',
    icon: <School sx={{ fontSize: 48 }} />,
    color: '#9B59B6',
    status: 'Active',
    path: '/tutor/dashboard',
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
    description: 'Connect with friends, messaging, diary',
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

function LaunchPage({ user }) {
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module.status === 'Active') {
      if (user || module.id === 'ca-foundation') {
        navigate(module.path);
      } else {
        navigate('/login', { state: { returnTo: module.path } });
      }
    }
  };

  return (
    <div className="launch-page">
      <Container maxWidth="xl">
        {/* Header */}
        <Box className="header fade-in">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" className="logo">
              🚀 MGrand Hub
            </Typography>
            <Chip label="SuperApp" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!user ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate('/register')}
                  sx={{ bgcolor: 'white', color: '#667eea' }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{ bgcolor: 'white', color: '#667eea' }}
              >
                Go to Dashboard
              </Button>
            )}
          </Box>
        </Box>

        {/* Hero Section */}
        <Box className="hero fade-in" sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            Welcome to MGrand Hub
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4 }}>
            Your All-in-One Platform for Everything You Need
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="🔐 Secure" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip label="⚡ Fast" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip label="🎯 All-in-One" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip label="📱 Mobile Ready" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
        </Box>

        {/* Modules Grid */}
        <Typography
          variant="h4"
          sx={{ color: 'white', textAlign: 'center', mb: 4, fontWeight: 'bold' }}
        >
          Explore Our Services
        </Typography>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {modules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <Card
                className={`module-card slide-in`}
                sx={{
                  height: '100%',
                  cursor: module.status === 'Active' ? 'pointer' : 'not-allowed',
                  opacity: module.status === 'Active' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 0.1}s`,
                  '&:hover': {
                    transform: module.status === 'Active' ? 'translateY(-8px)' : 'none',
                    boxShadow: module.status === 'Active' ? '0 12px 40px rgba(0,0,0,0.2)' : 'none',
                  },
                }}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      color: module.color,
                      mb: 2,
                    }}
                  >
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

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            py: 4,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="body2">
            © 2024 MGrand Hub. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Built with ❤️ using React & Node.js
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default LaunchPage;
