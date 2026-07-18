const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const testController = require('../controllers/testController');

// Test generation
router.post('/generate-questions', verifyToken, testController.generateQuestions);
router.post('/generate-adaptive', verifyToken, testController.generateAdaptiveTest);

// Test listing
router.get('/', verifyToken, testController.getAllTests);
router.get('/:id', verifyToken, testController.getTestById);

// Test attempts
router.post('/:testId/start', verifyToken, testController.startTestAttempt);
router.post('/attempt/:attemptId/answer', verifyToken, testController.submitAnswer);
router.post('/attempt/:attemptId/submit', verifyToken, testController.submitTest);
router.get('/my/attempts', verifyToken, testController.getMyAttempts);
router.get('/attempt/:id', verifyToken, testController.getAttemptById);

module.exports = router;
