const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const videoController = require('../controllers/videoController');

// Video lecture generation
router.post('/lesson/:lessonId/generate', verifyToken, videoController.generateVideoLecture);

// Animation generation
router.post('/animation/accounting', verifyToken, videoController.generateAccountingAnimation);
router.post('/animation/math', verifyToken, videoController.generateMathAnimation);

// Health check
router.get('/health', videoController.checkVideoSystemHealth);

module.exports = router;
