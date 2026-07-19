import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  Block as BlockIcon,
  ExitToApp as ExitIcon,
  Settings as SettingsIcon,
  VolumeOff as MuteIcon,
  Star as StarIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const ContactList = ({ chat, contacts }) => {
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    notifications: true,
    sound: true,
    encryption: false
  });

  const handleSettingChange = (setting) => {
    setChatSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getChatParticipants = () => {
    if (!chat || !chat.participants) return [];
    return chat.participants;
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const lastSeen = new Date(date);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (!chat) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Select a chat to view details
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Chat Info Header */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}>
          {chat.name?.[0] || <PersonIcon />}
        </Avatar>
        <Typography variant="h6">{chat.name || 'Chat'}</Typography>
        {chat.type === 'group' && (
          <Typography variant="caption" color="text.secondary">
            {chat.participants?.length} members
          </Typography>
        )}
        {chat.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {chat.description}
          </Typography>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-around', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton color="primary">
            <PhoneIcon />
          </IconButton>
          <Typography variant="caption" display="block">
            Call
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton color="primary">
            <VideoCallIcon />
          </IconButton>
          <Typography variant="caption" display="block">
            Video
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton>
            <MuteIcon />
          </IconButton>
          <Typography variant="caption" display="block">
            Mute
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton onClick={() => setSettingsDialog(true)}>
            <SettingsIcon />
          </IconButton>
          <Typography variant="caption" display="block">
            Settings
          </Typography>
        </Box>
      </Box>

      {/* Chat Members (for groups) */}
      {chat.type === 'group' && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Members ({getChatParticipants().length})
            </Typography>
            <List>
              {getChatParticipants().map((participant) => (
                <ListItem key={participant._id}>
                  <ListItemAvatar>
                    <Avatar>
                      {participant.name?.[0] || <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.name}
                    secondary={participant.email}
                  />
                  {chat.admins?.includes(participant._id) && (
                    <Chip label="Admin" size="small" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
              Add Member
            </Button>
          </Box>
          <Divider />
        </>
      )}

      {/* Shared Media */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Shared Media
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box
              key={item}
              sx={{
                paddingTop: '100%',
                backgroundColor: 'grey.200',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Image
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Button fullWidth variant="text" sx={{ mt: 1 }}>
          View All
        </Button>
      </Box>

      <Divider />

      {/* Chat Stats */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Statistics
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Messages"
              secondary={chat.messageCount || 0}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Created"
              secondary={new Date(chat.createdAt).toLocaleDateString()}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Last Active"
              secondary={formatLastSeen(chat.updatedAt)}
            />
          </ListItem>
        </List>
      </Box>

      <Divider />

      {/* Privacy & Support */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Privacy & Support
        </Typography>
        <List>
          <ListItem button>
            <ListItemText primary="Encryption Settings" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Block User" />
            <BlockIcon color="error" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Report Chat" />
          </ListItem>
          <ListItem button sx={{ color: 'error.main' }}>
            <ListItemText primary="Leave Chat" />
            <ExitIcon />
          </ListItem>
        </List>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Notifications"
                secondary="Receive notifications for new messages"
              />
              <Switch
                checked={chatSettings.notifications}
                onChange={() => handleSettingChange('notifications')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Sound"
                secondary="Play sound for new messages"
              />
              <Switch
                checked={chatSettings.sound}
                onChange={() => handleSettingChange('sound')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="End-to-End Encryption"
                secondary="Enable message encryption"
              />
              <Switch
                checked={chatSettings.encryption}
                onChange={() => handleSettingChange('encryption')}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Chat Customization
          </Typography>
          <TextField
            fullWidth
            label="Chat Nickname"
            placeholder="Enter custom name"
            size="small"
            sx={{ mt: 1, mb: 2 }}
          />
          
          <Button fullWidth variant="outlined" startIcon={<EditIcon />}>
            Change Chat Theme
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactList;
