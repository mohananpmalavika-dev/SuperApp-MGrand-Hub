import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Badge,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

const Notifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'course',
      title: 'New Course Available',
      message: 'CA Foundation - Financial Accounting Part 2 is now available',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      icon: 'school',
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You completed 10 lessons in a row. Keep it up!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: 'trophy',
    },
    {
      id: 3,
      type: 'test',
      title: 'Test Reminder',
      message: 'Your scheduled test "Business Laws Mock Test 1" starts in 1 hour',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
      icon: 'assignment',
    },
    {
      id: 4,
      type: 'info',
      title: 'Study Streak',
      message: '🔥 You\'re on a 7-day study streak! Don\'t break it.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: 'star',
    },
    {
      id: 5,
      type: 'warning',
      title: 'Upcoming Deadline',
      message: 'Complete Chapter 3 practice questions by tomorrow',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: true,
      icon: 'warning',
    },
    {
      id: 6,
      type: 'course',
      title: 'Lesson Completed',
      message: 'Great job completing "Introduction to Accounting Principles"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      read: true,
      icon: 'check',
    },
  ]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    handleMenuClose();
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    handleMenuClose();
  };

  const getIcon = (iconType) => {
    const iconStyle = { fontSize: 30 };
    switch (iconType) {
      case 'school': return <SchoolIcon sx={iconStyle} />;
      case 'trophy': return <TrophyIcon sx={iconStyle} />;
      case 'assignment': return <AssignmentIcon sx={iconStyle} />;
      case 'star': return <StarIcon sx={iconStyle} />;
      case 'warning': return <WarningIcon sx={iconStyle} />;
      case 'check': return <CheckCircleIcon sx={iconStyle} />;
      default: return <InfoIcon sx={iconStyle} />;
    }
  };

  const getAvatarColor = (type) => {
    switch (type) {
      case 'course': return '#1976d2';
      case 'achievement': return '#ffa726';
      case 'test': return '#66bb6a';
      case 'warning': return '#ef5350';
      default: return '#9e9e9e';
    }
  };

  const getTypeChip = (type) => {
    const configs = {
      course: { label: 'Course', color: 'primary' },
      achievement: { label: 'Achievement', color: 'warning' },
      test: { label: 'Test', color: 'success' },
      info: { label: 'Info', color: 'info' },
      warning: { label: 'Alert', color: 'error' },
    };
    const config = configs[type] || configs.info;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filterNotifications = () => {
    if (activeTab === 0) return notifications;
    if (activeTab === 1) return notifications.filter(n => !n.read);
    if (activeTab === 2) return notifications.filter(n => n.read);
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filterNotifications();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Badge>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay updated with your learning progress
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<DoneAllIcon />}
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          variant="outlined"
        >
          Mark All Read
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            label={
              <Badge badgeContent={notifications.length} color="primary">
                All
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="error">
                Unread
              </Badge>
            } 
          />
          <Tab label="Read" />
        </Tabs>
      </Paper>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications here
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {activeTab === 1 && "You're all caught up!"}
            {activeTab === 2 && "No read notifications yet"}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                    cursor: 'pointer',
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getAvatarColor(notification.type), width: 48, height: 48 }}>
                      {getIcon(notification.icon)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeChip(notification.type)}
                          <Typography variant="caption" color="text.disabled">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => markAsRead(selectedNotification.id)}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => deleteNotification(selectedNotification?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Notifications;
