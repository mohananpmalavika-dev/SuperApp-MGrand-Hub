const express = require('express');
const { voiceController, uploadAvatar } = require('../controllers/voice.controller');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Voice & Avatar Routes
 * All routes require authentication
 */

// Voice preferences
router.get('/preferences', auth, (req, res, next) => 
  voiceController.getPreferences(req, res, next)
);

router.put('/preferences', auth, (req, res, next) => 
  voiceController.updatePreferences(req, res, next)
);

// Speech synthesis
router.post('/speech', auth, (req, res, next) => 
  voiceController.generateSpeech(req, res, next)
);

router.post('/speech/lesson', auth, (req, res, next) => 
  voiceController.generateLessonSpeech(req, res, next)
);

router.post('/speech/quiz', auth, (req, res, next) => 
  voiceController.generateQuizSpeech(req, res, next)
);

// Avatar management
router.post('/avatar', auth, uploadAvatar, (req, res, next) => 
  voiceController.uploadAvatar(req, res, next)
);

// Face presets
router.post('/face-presets', auth, (req, res, next) => 
  voiceController.saveFacePreset(req, res, next)
);

router.delete('/face-presets/:presetId', auth, (req, res, next) => 
  voiceController.deleteFacePreset(req, res, next)
);

// Voice information
router.get('/voices', auth, (req, res, next) => 
  voiceController.getAvailableVoices(req, res, next)
);

module.exports = router;
