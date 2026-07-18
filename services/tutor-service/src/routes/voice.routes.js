const express = require('express');
const { voiceController, uploadAvatar } = require('../controllers/voice.controller');
const { authenticate } = require('../../../packages/shared/src/middleware/auth');

const router = express.Router();

/**
 * Voice & Avatar Routes
 * All routes require authentication
 */

// Voice preferences
router.get('/preferences', authenticate, (req, res, next) => 
  voiceController.getPreferences(req, res, next)
);

router.put('/preferences', authenticate, (req, res, next) => 
  voiceController.updatePreferences(req, res, next)
);

// Speech synthesis
router.post('/speech', authenticate, (req, res, next) => 
  voiceController.generateSpeech(req, res, next)
);

router.post('/speech/lesson', authenticate, (req, res, next) => 
  voiceController.generateLessonSpeech(req, res, next)
);

router.post('/speech/quiz', authenticate, (req, res, next) => 
  voiceController.generateQuizSpeech(req, res, next)
);

// Avatar management
router.post('/avatar', authenticate, uploadAvatar, (req, res, next) => 
  voiceController.uploadAvatar(req, res, next)
);

// Face presets
router.post('/face-presets', authenticate, (req, res, next) => 
  voiceController.saveFacePreset(req, res, next)
);

router.delete('/face-presets/:presetId', authenticate, (req, res, next) => 
  voiceController.deleteFacePreset(req, res, next)
);

// Voice information
router.get('/voices', authenticate, (req, res, next) => 
  voiceController.getAvailableVoices(req, res, next)
);

module.exports = router;
