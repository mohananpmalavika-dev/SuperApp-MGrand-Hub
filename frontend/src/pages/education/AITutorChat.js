import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Card,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import {
  Send,
  Mic,
  Image as ImageIcon,
  SmartToy,
  Person,
} from '@mui/icons-material';
import { sendTutorMessage, addMessage } from '../../store/slices/tutorSlice';

const AITutorChat = () => {
  const dispatch = useDispatch();
  const { messages, typing } = useSelector((state) => state.tutor);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInput('');

    try {
      await dispatch(sendTutorMessage({ message: input, image: imageFile })).unwrap();
      setImageFile(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const suggestedQuestions = [
    'Explain the accounting equation',
    'What is double entry bookkeeping?',
    'Help me solve this problem',
    'Summarize today\'s lesson',
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        AI Tutor Chat
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Ask me anything! I'm here to help 24/7
      </Typography>

      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && (
            <Box textAlign="center" py={4}>
              <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Welcome! How can I help you today?
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" mt={3}>
                {suggestedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => setInput(question)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'user' ? 'flex-end' : 'flex-start'}
              mb={2}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <SmartToy />
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}

          {typing && (
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                <SmartToy />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">Typing...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {imageFile && (
            <Chip
              label={imageFile.name}
              onDelete={() => setImageFile(null)}
              sx={{ mb: 1 }}
            />
          )}
          <Box display="flex" gap={1}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <IconButton onClick={() => fileInputRef.current?.click()}>
              <ImageIcon />
            </IconButton>
            <IconButton>
              <Mic />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              variant="outlined"
              size="small"
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() && !imageFile}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default AITutorChat;
