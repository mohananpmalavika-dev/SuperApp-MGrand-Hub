const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const messagingController = require('../controllers/messagingController');
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const contactRoutes = require('./contacts');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype.startsWith('image/') 
      ? './uploads/images'
      : file.mimetype.startsWith('video/')
      ? './uploads/videos'
      : file.mimetype.startsWith('audio/')
      ? './uploads/audio'
      : './uploads/files';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mp3|wav|ogg|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Chat Management
router.post('/chats', messagingController.createChat);
router.get('/chats', messagingController.getUserChats);
router.get('/chats/:chatId', messagingController.getChatById);
router.post('/chats/:chatId/participants', messagingController.addParticipants);
router.post('/chats/:chatId/leave', messagingController.leaveChat);

// Message Management
router.post('/chats/:chatId/messages', upload.array('files', 10), messagingController.sendMessage);
router.get('/chats/:chatId/messages', messagingController.getMessages);
router.put('/messages/:messageId', messagingController.editMessage);
router.delete('/messages/:messageId', messagingController.deleteMessage);
router.post('/messages/:messageId/react', messagingController.reactToMessage);
router.post('/chats/:chatId/read', messagingController.markAsRead);

// Search
router.get('/search', messagingController.searchMessages);

// AI Features
router.get('/messages/:messageId/smart-reply', messagingController.getSmartReply);
router.post('/messages/:messageId/translate', messagingController.translateMessage);
router.get('/chats/:chatId/summarize', messagingController.summarizeChat);

// Calls
router.post('/chats/:chatId/calls', messagingController.initiateCall);
router.post('/calls/:callId/answer', messagingController.answerCall);
router.post('/calls/:callId/end', messagingController.endCall);

// Contacts (new comprehensive contact management)
router.use('/contacts', contactRoutes);

// Legacy contact endpoints (can be removed if not used)
// router.get('/contacts', messagingController.getContacts);
// router.post('/contacts', messagingController.addContact);
// router.post('/contacts/block', messagingController.blockUser);

// Media Upload
router.post('/upload', upload.single('file'), messagingController.uploadMedia);

// Statistics
router.get('/chats/:chatId/stats', messagingController.getChatStats);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'messaging-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
