import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Chip,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import axios from 'axios';
import ChatWindow from '../../components/messaging/ChatWindow';
import ContactList from '../../components/messaging/ContactList';
import AddContactDialog from '../../components/messaging/AddContactDialog';
import ContactRequestsDialog from '../../components/messaging/ContactRequestsDialog';

const MessagingDashboard = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [newChatDialog, setNewChatDialog] = useState(false);
  const [addContactDialog, setAddContactDialog] = useState(false);
  const [contactRequestsDialog, setContactRequestsDialog] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [newChatType, setNewChatType] = useState('direct');
  const [newChatData, setNewChatData] = useState({
    participants: [],
    name: '',
    description: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io(`${API_URL}`, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to messaging service');
    });

    newSocket.on('userOnline', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('userOffline', (userId) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    newSocket.on('newMessage', (message) => {
      handleNewMessage(message);
    });

    newSocket.on('messageEdited', (data) => {
      handleMessageEdited(data);
    });

    newSocket.on('messageDeleted', (data) => {
      handleMessageDeleted(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    loadChats();
    loadContacts();
    loadPendingRequestsCount();
  }, []);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messaging/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data.data);
    } catch (error) {
      console.error('Load chats error:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messaging/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.data);
    } catch (error) {
      console.error('Load contacts error:', error);
    }
  };

  const loadPendingRequestsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messaging/contacts/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequestsCount(response.data.data?.length || 0);
    } catch (error) {
      console.error('Load pending requests error:', error);
    }
  };

  const handleNewMessage = (message) => {
    // Update chat list with new message
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c._id === message.chat);
      if (chatIndex !== -1) {
        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: message,
          updatedAt: message.createdAt
        };
        // Move to top
        const chat = updatedChats.splice(chatIndex, 1)[0];
        return [chat, ...updatedChats];
      }
      return prevChats;
    });
  };

  const handleMessageEdited = (data) => {
    if (selectedChat?._id === data.chatId) {
      // Trigger chat window update
      setSelectedChat({ ...selectedChat, lastUpdate: Date.now() });
    }
  };

  const handleMessageDeleted = (data) => {
    if (selectedChat?._id === data.chatId) {
      // Trigger chat window update
      setSelectedChat({ ...selectedChat, lastUpdate: Date.now() });
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/messaging/chats`,
        {
          type: newChatType,
          ...newChatData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setChats([response.data.data, ...chats]);
      setSelectedChat(response.data.data);
      setNewChatDialog(false);
      setNewChatData({ participants: [], name: '', description: '' });
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const handleStartCall = async (video = false) => {
    if (!selectedChat) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/messaging/chats/${selectedChat._id}/calls`,
        { type: video ? 'video' : 'audio', video },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to call interface or open call modal
      console.log('Call initiated:', response.data.data);
    } catch (error) {
      console.error('Start call error:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(query) ||
      chat.participants?.some(p => p.name?.toLowerCase().includes(query))
    );
  });

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return <GroupIcon />;
    }
    // For direct chats, show other participant's avatar
    return <PersonIcon />;
  };

  const getChatName = (chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct' && chat.participants) {
      const otherParticipant = chat.participants.find(p => p._id !== localStorage.getItem('userId'));
      return otherParticipant?.name || 'Unknown';
    }
    return 'Chat';
  };

  const getUnreadCount = (chat) => {
    // Calculate unread messages
    return chat.unreadCount || 0;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Messages</Typography>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => setContactRequestsDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={pendingRequestsCount} color="error">
                      <PersonIcon />
                    </Badge>
                  </IconButton>
                  <IconButton size="small" onClick={() => setAddContactDialog(true)} sx={{ mr: 1 }}>
                    <PersonIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => setNewChatDialog(true)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <List sx={{ flex: 1, overflow: 'auto' }}>
              {filteredChats.map(chat => (
                <ListItem
                  key={chat._id}
                  button
                  selected={selectedChat?._id === chat._id}
                  onClick={() => setSelectedChat(chat)}
                >
                  <ListItemAvatar>
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={!onlineUsers.has(chat.participants?.[0]?._id)}
                    >
                      <Avatar>{getChatAvatar(chat)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getChatName(chat)}
                    secondary={chat.lastMessage?.content || 'No messages yet'}
                    secondaryTypographyProps={{
                      noWrap: true
                    }}
                  />
                  {getUnreadCount(chat) > 0 && (
                    <Chip
                      label={getUnreadCount(chat)}
                      size="small"
                      color="primary"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>{getChatAvatar(selectedChat)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{getChatName(selectedChat)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedChat.type === 'group' 
                        ? `${selectedChat.participants?.length} members`
                        : 'Active now'}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => handleStartCall(false)}>
                    <PhoneIcon />
                  </IconButton>
                  <IconButton onClick={() => handleStartCall(true)}>
                    <VideoCallIcon />
                  </IconButton>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Messages */}
                <ChatWindow
                  chat={selectedChat}
                  socket={socket}
                  token={token}
                  apiUrl={API_URL}
                />
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a chat to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Contact List / Chat Info */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%' }}>
            {selectedChat ? (
              <ContactList chat={selectedChat} contacts={contacts} />
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Contacts</Typography>
                <List>
                  {contacts.slice(0, 10).map(contact => (
                    <ListItem key={contact._id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={contact.nickname || contact.user?.name}
                        secondary={contact.user?.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Chat Dialog */}
      <Dialog open={newChatDialog} onClose={() => setNewChatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Chat</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant={newChatType === 'direct' ? 'contained' : 'outlined'}
              onClick={() => setNewChatType('direct')}
            >
              Direct Chat
            </Button>
            <Button
              variant={newChatType === 'group' ? 'contained' : 'outlined'}
              onClick={() => setNewChatType('group')}
            >
              Group Chat
            </Button>
          </Box>

          {newChatType === 'group' && (
            <>
              <TextField
                fullWidth
                label="Group Name"
                value={newChatData.name}
                onChange={(e) => setNewChatData({ ...newChatData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newChatData.description}
                onChange={(e) => setNewChatData({ ...newChatData, description: e.target.value })}
                sx={{ mb: 2 }}
              />
            </>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Select Participants
          </Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {contacts.map(contact => (
              <ListItem key={contact._id}>
                <ListItemAvatar>
                  <Avatar><PersonIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText primary={contact.nickname || contact.user?.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateChat} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Chat Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {/* View info */}}>View Info</MenuItem>
        <MenuItem onClick={() => {/* Mute */}}>Mute Notifications</MenuItem>
        <MenuItem onClick={() => {/* Clear */}}>Clear Messages</MenuItem>
        <MenuItem onClick={() => {/* Leave */}}>Leave Chat</MenuItem>
      </Menu>

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={addContactDialog}
        onClose={() => setAddContactDialog(false)}
        apiUrl={API_URL}
        token={token}
        onContactAdded={() => {
          loadContacts();
          setAddContactDialog(false);
        }}
      />

      {/* Contact Requests Dialog */}
      <ContactRequestsDialog
        open={contactRequestsDialog}
        onClose={() => setContactRequestsDialog(false)}
        apiUrl={API_URL}
        token={token}
        onRequestHandled={() => {
          loadContacts();
          loadPendingRequestsCount();
        }}
      />
    </Box>
  );
};

export default MessagingDashboard;
