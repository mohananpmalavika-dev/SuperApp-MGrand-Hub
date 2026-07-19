import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Send, SmartToy } from '@mui/icons-material';
import { askCAFoundationTutor } from '../../services/caFoundationService';

const LessonTutor = ({ courseId, lessonIndex, topic }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    'Teach this chapter from the beginning',
    'Give me a simple example, then an exam-level example',
    'Test me and diagnose my weak point',
    'Explain the most common exam mistake',
  ];

  const ask = async (value = question) => {
    const cleanQuestion = value.trim();
    if (!cleanQuestion || loading) return;
    setMessages((current) => [...current, { role: 'student', content: cleanQuestion }]);
    setQuestion('');
    setError('');
    setLoading(true);
    try {
      const result = await askCAFoundationTutor({
        courseId,
        lessonIndex,
        question: cleanQuestion,
      });
      setMessages((current) => [...current, { role: 'tutor', content: result.answer }]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'The tutor could not answer right now. Your lesson content is still available.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <SmartToy color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Ask your {topic} tutor
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          Every answer is grounded in this Drive lesson. Ask for slower teaching, another example,
          a Hindi-English explanation, a quiz, or feedback on your working.
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" sx={{ my: 3 }}>
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onClick={() => ask(suggestion)}
              disabled={loading}
              clickable
            />
          ))}
        </Box>

        <Divider />
        <Stack spacing={2} sx={{ py: 3 }}>
          {messages.length === 0 && (
            <Alert severity="info">
              Start with what you do not understand. The tutor will teach, check, and reteach.
            </Alert>
          )}
          {messages.map((message, index) => (
            <Box
              key={`${message.role}-${index}`}
              sx={{
                alignSelf: message.role === 'student' ? 'flex-end' : 'stretch',
                maxWidth: message.role === 'student' ? '80%' : '100%',
                p: 2,
                borderRadius: 2,
                bgcolor: message.role === 'student' ? 'primary.main' : 'action.hover',
                color: message.role === 'student' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              {message.role === 'tutor' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <Typography>{message.content}</Typography>
              )}
            </Box>
          ))}
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography color="text.secondary">Teaching from this lesson…</Typography>
            </Stack>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: I understand the rule, but I don't know when to apply the exception."
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                ask();
              }
            }}
          />
          <Button
            variant="contained"
            endIcon={<Send />}
            disabled={!question.trim() || loading}
            onClick={() => ask()}
            sx={{ minWidth: 120 }}
          >
            Ask
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LessonTutor;
