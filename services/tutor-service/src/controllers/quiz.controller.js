const tutorService = require('../services/tutor.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');

/**
 * Generate new quiz
 */
exports.generateQuiz = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const quizParams = req.body;

  const quiz = await tutorService.generateQuiz(userId, quizParams);

  res.status(201).json(apiResponse.success(quiz, 'Quiz generated successfully'));
});

/**
 * Get quiz details
 */
exports.getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const Quiz = require('../models/Quiz.model');

  const quiz = await Quiz.findById(quizId);
  
  if (!quiz) {
    return res.status(404).json(apiResponse.error('Quiz not found'));
  }

  if (quiz.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  // Hide correct answers if quiz is in progress
  if (quiz.status === 'in-progress') {
    quiz.questions.forEach((q) => {
      delete q.correctAnswer;
    });
  }

  res.json(apiResponse.success(quiz, 'Quiz retrieved successfully'));
});

/**
 * Submit quiz answers
 */
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;

  const results = await tutorService.evaluateQuiz(quizId, answers);

  res.json(apiResponse.success(results, 'Quiz evaluated successfully'));
});

/**
 * Get user's quizzes
 */
exports.getUserQuizzes = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const { status, subject, limit = 20, page = 1 } = req.query;
  const Quiz = require('../models/Quiz.model');

  const query = { userId };
  if (status) query.status = status;
  if (subject) query.subject = subject;

  const quizzes = await Quiz.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .select('-questions.correctAnswer'); // Hide answers in list

  const total = await Quiz.countDocuments(query);

  res.json(apiResponse.success({
    quizzes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Quizzes retrieved successfully'));
});

/**
 * Get quiz results with detailed feedback
 */
exports.getQuizResults = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const Quiz = require('../models/Quiz.model');

  const quiz = await Quiz.findById(quizId);
  
  if (!quiz) {
    return res.status(404).json(apiResponse.error('Quiz not found'));
  }

  if (quiz.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  if (quiz.status !== 'completed') {
    return res.status(400).json(apiResponse.error('Quiz not completed yet'));
  }

  res.json(apiResponse.success({
    quizId: quiz._id,
    subject: quiz.subject,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    results: quiz.results,
    feedback: quiz.feedback,
    adaptiveData: quiz.adaptiveData,
    questions: quiz.questions.map((q) => ({
      question: q.question,
      yourAnswer: q.selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: q.isCorrect,
      explanation: q.explanation,
      points: q.points,
    })),
  }, 'Quiz results retrieved successfully'));
});

/**
 * Retry quiz
 */
exports.retryQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  const Quiz = require('../models/Quiz.model');

  const originalQuiz = await Quiz.findById(quizId);
  
  if (!originalQuiz) {
    return res.status(404).json(apiResponse.error('Quiz not found'));
  }

  if (originalQuiz.userId.toString() !== userId) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  // Generate new quiz with same parameters
  const newQuiz = await tutorService.generateQuiz(userId, {
    subject: originalQuiz.subject,
    topic: originalQuiz.topic,
    difficulty: originalQuiz.difficulty,
    questionCount: originalQuiz.questions.length,
    sessionId: originalQuiz.sessionId,
  });

  res.status(201).json(apiResponse.success(newQuiz, 'New quiz generated for retry'));
});
