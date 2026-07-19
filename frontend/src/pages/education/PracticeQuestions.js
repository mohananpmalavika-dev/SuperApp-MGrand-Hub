import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Lightbulb,
  NavigateNext,
  NavigateBefore,
  Flag,
} from '@mui/icons-material';

const PracticeQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'What is the accounting equation?',
      options: [
        'Assets = Liabilities + Capital',
        'Assets = Liabilities - Capital',
        'Assets + Liabilities = Capital',
        'Capital = Assets + Liabilities',
      ],
      correctAnswer: 0,
      explanation: 'The fundamental accounting equation states that Assets = Liabilities + Capital. This equation must always balance.',
      hint: 'Think about what a business owns and owes.',
      difficulty: 'easy',
    },
    // Add more questions here
  ];

  const question = questions[currentQuestion];

  const handleAnswerChange = (event) => {
    if (!submitted) {
      setSelectedAnswer(event.target.value);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (parseInt(selectedAnswer) === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer('');
    setSubmitted(false);
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
    setSelectedAnswer('');
    setSubmitted(false);
  };

  const isCorrect = submitted && parseInt(selectedAnswer) === question.correctAnswer;
  const isWrong = submitted && parseInt(selectedAnswer) !== question.correctAnswer;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Practice Questions
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Typography variant="body2">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((currentQuestion + 1) / questions.length) * 100}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Chip label={`Score: ${score}/${currentQuestion + (submitted ? 1 : 0)}`} color="primary" />
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Chip
              label={question.difficulty}
              size="small"
              color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'}
            />
            <Chip label="MCQ" size="small" variant="outlined" />
          </Box>

          <Typography variant="h6" gutterBottom>
            {question.question}
          </Typography>

          <FormControl component="fieldset" fullWidth sx={{ mt: 3 }}>
            <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                  disabled={submitted}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: 1,
                    borderColor: submitted
                      ? index === question.correctAnswer
                        ? 'success.main'
                        : index === parseInt(selectedAnswer)
                        ? 'error.main'
                        : 'divider'
                      : 'divider',
                    borderRadius: 1,
                    bgcolor: submitted
                      ? index === question.correctAnswer
                        ? 'success.light'
                        : index === parseInt(selectedAnswer)
                        ? 'error.light'
                        : 'transparent'
                      : 'transparent',
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {submitted && (
            <Box mt={3}>
              {isCorrect ? (
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="subtitle2">Correct!</Typography>
                  <Typography variant="body2">{question.explanation}</Typography>
                </Alert>
              ) : (
                <Alert severity="error" icon={<Cancel />}>
                  <Typography variant="subtitle2">Incorrect</Typography>
                  <Typography variant="body2">{question.explanation}</Typography>
                </Alert>
              )}
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Button
              startIcon={<Lightbulb />}
              onClick={() => setHintOpen(true)}
              disabled={submitted}
            >
              Hint
            </Button>
            <Box display="flex" gap={1}>
              <IconButton
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <NavigateBefore />
              </IconButton>
              {!submitted ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                  endIcon={<NavigateNext />}
                >
                  Next Question
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={hintOpen} onClose={() => setHintOpen(false)}>
        <DialogTitle>Hint</DialogTitle>
        <DialogContent>
          <Typography>{question.hint}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHintOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PracticeQuestions;
