const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Controllers
const sessionController = require('../controllers/session.controller');
const quizController = require('../controllers/quiz.controller');

// Sub-routes
const voiceRoutes = require('./voice.routes');

// ========== VOICE & AVATAR ROUTES ==========
router.use('/voice', voiceRoutes);

// ========== SESSION ROUTES ==========
router.post('/sessions/start', auth, sessionController.startSession);
router.get('/sessions/:sessionId', auth, sessionController.getSession);
router.get('/sessions/user/:userId', auth, sessionController.getUserSessions);
router.post('/sessions/:sessionId/progress', auth, sessionController.updateProgress);
router.post('/sessions/:sessionId/complete', auth, sessionController.completeSession);
router.post('/sessions/:sessionId/pause', auth, sessionController.pauseSession);
router.post('/sessions/:sessionId/resume', auth, sessionController.resumeSession);

// ========== QUIZ ROUTES ==========
router.post('/quiz/generate', auth, quizController.generateQuiz);
router.get('/quiz/:quizId', auth, quizController.getQuiz);
router.post('/quiz/submit', auth, quizController.submitQuiz);
router.get('/quiz/user/:userId', auth, quizController.getUserQuizzes);
router.get('/quiz/:quizId/results', auth, quizController.getQuizResults);
router.post('/quiz/:quizId/retry', auth, quizController.retryQuiz);

// ========== ANALYTICS ROUTES ==========
router.get('/analytics/dashboard', auth, async (req, res) => {
  const tutorService = require('../services/tutor.service');
  const { apiResponse } = require('../utils/apiResponse');
  
  try {
    const dashboard = await tutorService.getUserDashboard(req.user.id);
    res.json(apiResponse.success(dashboard, 'Dashboard data retrieved'));
  } catch (error) {
    res.status(500).json(apiResponse.error(error.message));
  }
});

// ========== LEARNING PATH ROUTES ==========
router.post('/learning-paths', auth, async (req, res) => {
  const tutorService = require('../services/tutor.service');
  const { apiResponse } = require('../utils/apiResponse');
  
  try {
    const path = await tutorService.createLearningPath(req.user.id, req.body);
    res.status(201).json(apiResponse.success(path, 'Learning path created'));
  } catch (error) {
    res.status(500).json(apiResponse.error(error.message));
  }
});

router.get('/learning-paths/user/:userId', auth, async (req, res) => {
  const LearningPath = require('../models/LearningPath.model');
  const { apiResponse } = require('../utils/apiResponse');
  
  try {
    const paths = await LearningPath.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(apiResponse.success(paths, 'Learning paths retrieved'));
  } catch (error) {
    res.status(500).json(apiResponse.error(error.message));
  }
});

// ========== HEALTH CHECK ==========
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'tutor-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
