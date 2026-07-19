import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Typography,
  Paper,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ chat, socket, token, apiUrl }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (chat) {
      loadMessages();
      markAsRead();
    }
  }, [chat]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('messageEdited', handleMessageEdited);
      socket.on('messageDeleted', handleMessageDeleted);
      socket.on('typing', handleTyping);
      socket.on('stopTyping', handleStopTyping);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageEdited', handleMessageEdited);
        socket.off('messageDeleted', handleMessageDeleted);
        socket.off('typing', handleTyping);
        socket.off('stopTyping', handleStopTyping);
      };
    }
  }, [socket, chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (pageNum = 1) => {
    if (!chat) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${apiUrl}/api/messaging/chats/${chat._id}/messages`,
        {
          params: { page: pageNum, limit: 50 },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (pageNum === 1) {
        setMessages(response.data.data.messages || []);
      } else {
        setMessages(prev => [...response.data.data.messages, ...prev]);
      }

      setHasMore(response.data.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!chat) return;

    try {
      const unreadMessages = messages
        .filter(m => m.sender._id !== userId && !m.readBy.includes(userId))
        .map(m => m._id);

      if (unreadMessages.length > 0) {
        await axios.post(
          `${apiUrl}/api/messaging/chats/${chat._id}/read`,
          { messageIds: unreadMessages },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chat === chat._id) {
      setMessages(prev => [...prev, message]);
      markAsRead();
    }
  };

  const handleMessageEdited = (data) => {
    if (data.chatId === chat._id) {
      setMessages(prev =>
        prev.map(m => (m._id === data.messageId ? { ...m, ...data.updates } : m))
      );
    }
  };

  const handleMessageDeleted = (data) => {
    if (data.chatId === chat._id) {
      setMessages(prev =>
        prev.map(m =>
          m._id === data.messageId
            ? { ...m, deleted: true, content: 'Message deleted' }
            : m
        )
      );
    }
  };

  const handleTyping = (data) => {
    if (data.chatId === chat._id && data.userId !== userId) {
      setTyping(true);
    }
  };

  const handleStopTyping = (data) => {
    if (data.chatId === chat._id) {
      setTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !editingMessage) return;

    try {
      if (editingMessage) {
        // Edit existing message
        await axios.put(
          `${apiUrl}/api/messaging/messages/${editingMessage._id}`,
          { content: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingMessage(null);
      } else {
        // Send new message
        const messageData = {
          content: messageText,
          type: 'text'
        };

        if (replyToMessage) {
          messageData.replyTo = replyToMessage._id;
        }

        await axios.post(
          `${apiUrl}/api/messaging/chats/${chat._id}/messages`,
          messageData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setReplyToMessage(null);
      }

      setMessageText('');
      socket.emit('stopTyping', { chatId: chat._id });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('type', 'media');

      await axios.post(
        `${apiUrl}/api/messaging/chats/${chat._id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessageText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      await axios.post(
        `${apiUrl}/api/messaging/messages/${messageId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('React to message error:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `${apiUrl}/api/messaging/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnchorEl(null);
    } catch (error) {
      console.error('Delete message error:', error);
    }
  };

  const handleTypingChange = (e) => {
    setMessageText(e.target.value);

    // Emit typing event
    if (socket) {
      socket.emit('typing', { chatId: chat._id });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { chatId: chat._id });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message) => {
    return message.sender._id === userId;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading && page === 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {hasMore && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => loadMessages(page + 1)}
                >
                  Load more messages
                </Typography>
              </Box>
            )}

            <List>
              {messages.map((message, index) => (
                <ListItem
                  key={message._id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: isMyMessage(message) ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', maxWidth: '70%' }}>
                    {!isMyMessage(message) && (
                      <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                        {message.sender.name?.[0]}
                      </Avatar>
                    )}

                    <Paper
                      sx={{
                        p: 1.5,
                        backgroundColor: isMyMessage(message) ? 'primary.main' : 'grey.200',
                        color: isMyMessage(message) ? 'white' : 'text.primary'
                      }}
                    >
                      {message.replyTo && (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            borderLeft: 3,
                            borderColor: 'divider',
                            backgroundColor: 'rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography variant="caption">
                            {message.replyTo.content}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2">{message.content}</Typography>

                      {message.media && message.media.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {message.media.map((media, idx) => (
                            <img
                              key={idx}
                              src={media.url}
                              alt="attachment"
                              style={{ maxWidth: '100%', borderRadius: 8 }}
                            />
                          ))}
                        </Box>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {message.reactions.map((reaction, idx) => (
                            <Chip
                              key={idx}
                              label={`${reaction.emoji} ${reaction.users.length}`}
                              size="small"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}

                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                        {formatTime(message.createdAt)}
                        {message.edited && ' (edited)'}
                      </Typography>
                    </Paper>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedMessage(message);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>

            {typing && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Someone is typing...
              </Typography>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Reply Preview */}
      {replyToMessage && (
        <Box sx={{ p: 1, backgroundColor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Replying to
              </Typography>
              <Typography variant="body2">{replyToMessage.content}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setReplyToMessage(null)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
          value={messageText}
          onChange={handleTypingChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          InputProps={{
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <IconButton onClick={() => fileInputRef.current.click()}>
                    <AttachFileIcon />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileUpload}
                  />
                </InputAdornment>
                <InputAdornment position="start">
                  <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <EmojiIcon />
                  </IconButton>
                </InputAdornment>
              </>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="primary" onClick={handleSendMessage}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {showEmojiPicker && (
          <Box sx={{ position: 'absolute', bottom: 80, left: 20, zIndex: 1000 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
      </Box>

      {/* Message Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setReplyToMessage(selectedMessage);
            setAnchorEl(null);
          }}
        >
          <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        {isMyMessage(selectedMessage) && (
          <>
            <MenuItem
              onClick={() => {
                setEditingMessage(selectedMessage);
                setMessageText(selectedMessage.content);
                setAnchorEl(null);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => handleDeleteMessage(selectedMessage._id)}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => handleReactToMessage(selectedMessage._id, '👍')}>
          React
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatWindow;
