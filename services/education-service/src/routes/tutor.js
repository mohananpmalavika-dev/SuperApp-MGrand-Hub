const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { uploadAudio, uploadImage } = require('../middleware/upload');
const tutorController = require('../controllers/tutorController');

// Chat routes
router.post('/ask', verifyToken, tutorController.askQuestion);
router.post('/chat/start', verifyToken, tutorController.startChatSession);
router.post('/chat/:sessionId/message', verifyToken, tutorController.sendMessage);
router.post('/chat/:sessionId/stream', verifyToken, tutorController.streamChatResponse);
router.get('/chat/history', verifyToken, tutorController.getChatHistory);
router.get('/chat/:sessionId', verifyToken, tutorController.getChatSession);
router.post('/chat/:sessionId/end', verifyToken, tutorController.endChatSession);

// Voice routes
router.post('/voice/question', verifyToken, uploadAudio.single('audio'), tutorController.voiceQuestion);

// Help routes
router.post('/explain', verifyToken, tutorController.explainAnswer);
router.post('/hints', verifyToken, tutorController.getHints);

module.exports = router;
