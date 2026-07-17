import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Notifications as NotificationsIcon,
  Email,
  Sms,
  Refresh,
  Delete,
  MarkEmailRead,
} from '@mui/icons-material';
import axios from 'axios';
import './NotificationsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function NotificationsPage({ user }) {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    email: 0,
    sms: 0,
    push: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/notifications/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        setNotifications(data);
        
        // Calculate stats
        setStats({
          total: data.length,
          unread: data.filter((n) => n.status === 'pending' || n.status === 'sent').length,
          email: data.filter((n) => n.type === 'email').length,
          sms: data.filter((n) => n.type === 'sms').length,
          push: data.filter((n) => n.type === 'push').length,
        });
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'email':
        return <Email />;
      case 'sms':
        return <Sms />;
      case 'push':
        return <NotificationsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return '#4ECDC4';
      case 'sms':
        return '#F38181';
      case 'push':
        return '#667eea';
      default:
        return '#95E1D3';
    }
  };

  const filterNotifications = (type) => {
    if (type === 'all') return notifications;
    return notifications.filter((n) => n.type === type);
  };

  const NotificationList = ({ notifications: notifs }) => (
    <List>
      {notifs.length === 0 ? (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body2" color="text.secondary" align="center">
                No notifications found
              </Typography>
            }
          />
        </ListItem>
      ) : (
        notifs.map((notification, index) => (
          <React.Fragment key={notification._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getTypeColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1">
                      {notification.subject || 'Notification'}
                    </Typography>
                    <Chip
                      label={notification.status}
                      size="small"
                      color={getStatusColor(notification.status)}
                    />
                    <Chip
                      label={notification.type}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {notification.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                    {notification.metadata && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`Priority: ${notification.metadata.priority || 'normal'}`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {notification.metadata.category && (
                          <Chip
                            label={notification.metadata.category}
                            size="small"
                          />
                        )}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
            {index < notifs.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))
      )}
    </List>
  );

  return (
    <div className="notifications-page">
      {/* App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
          <IconButton color="inherit" onClick={fetchNotifications}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 150, bgcolor: '#667eea', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h3">{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, bgcolor: '#FFA07A', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Unread</Typography>
              <Typography variant="h3">{stats.unread}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, bgcolor: '#4ECDC4', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Email</Typography>
              <Typography variant="h3">{stats.email}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, bgcolor: '#F38181', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">SMS</Typography>
              <Typography variant="h3">{stats.sms}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, bgcolor: '#95E1D3', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Push</Typography>
              <Typography variant="h3">{stats.push}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Notifications List */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All" />
              <Tab label="Email" />
              <Tab label="SMS" />
              <Tab label="Push" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <NotificationList notifications={filterNotifications('all')} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <NotificationList notifications={filterNotifications('email')} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <NotificationList notifications={filterNotifications('sms')} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <NotificationList notifications={filterNotifications('push')} />
            )}
          </TabPanel>
        </Card>

        {/* Test Notification Section */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send test notifications to verify the system is working
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Email />}
                onClick={() => alert('Email notification feature - API integration needed')}
              >
                Send Test Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<Sms />}
                onClick={() => alert('SMS notification feature - API integration needed')}
              >
                Send Test SMS
              </Button>
              <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                onClick={() => alert('Push notification feature - API integration needed')}
              >
                Send Test Push
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

export default NotificationsPage;
