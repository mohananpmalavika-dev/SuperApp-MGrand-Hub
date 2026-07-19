const VoicePreferences = require('../models/VoicePreferences.model');
const speechService = require('../services/speech.service');
const tutorService = require('../services/tutor.service');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  },
});

/**
 * Voice Controller
 * Handles voice preferences, TTS, avatar management
 */
class VoiceController {
  /**
   * Get user's voice preferences
   */
  async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferences = await VoicePreferences.getOrCreate(userId);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      logger.error('Error fetching voice preferences:', error);
      next(error);
    }
  }

  /**
   * Update user's voice preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Validate updates
      const allowedFields = [
        'voice',
        'language',
        'voiceSpeed',
        'voicePitch',
        'autoPlayVoice',
        'autoSendVoiceTranscript',
        'customAvatarName',
        'preferredScenario',
        'tutorPersona',
        'enableVoiceInput',
        'enableVoiceOutput',
        'showWaveformVisual',
        'useSubtitles',
        'highContrastMode',
      ];

      const filteredUpdates = {};
      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      const preferences = await VoicePreferences.findOneAndUpdate(
        { userId },
        { $set: filteredUpdates },
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Voice preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      logger.error('Error updating voice preferences:', error);
      next(error);
    }
  }

  /**
   * Generate speech audio from text
   */
  async generateSpeech(req, res, next) {
    try {
      const { text, language, voiceType, voiceSpeed, voicePitch } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text is required',
        });
      }

      // Get user's preferences if not provided
      const userId = req.user.id;
      const preferences = await VoicePreferences.getOrCreate(userId);

      const finalLanguage = language || preferences.language;
      const finalVoiceType = voiceType || preferences.voice;
      const finalVoiceSpeed = voiceSpeed !== undefined ? voiceSpeed : preferences.voiceSpeed;
      const finalVoicePitch = voicePitch !== undefined ? voicePitch : preferences.voicePitch;

      const audioResult = await speechService.generateAudio(
        text,
        finalLanguage,
        finalVoiceType,
        finalVoiceSpeed,
        finalVoicePitch
      );

      res.json({
        success: true,
        data: audioResult,
      });
    } catch (error) {
      logger.error('Error generating speech:', error);
      next(error);
    }
  }

  /**
   * Generate speech for lesson section
   */
  async generateLessonSpeech(req, res, next) {
    try {
      const { sessionId, sectionIndex } = req.body;
      const userId = req.user.id;

      // Get session and lesson content
      const session = await tutorService.getSessionById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Get preferences
      const preferences = await VoicePreferences.getOrCreate(userId);

      // Generate audio for specific section
      // Note: Need to fetch lesson content from session
      const lessonSection = {
        content: `This is lesson section ${sectionIndex} content.`,
      };

      const audioResult = await speechService.generateLessonAudio(
        lessonSection,
        preferences.language,
        preferences.voice,
        preferences.voiceSpeed,
        preferences.voicePitch
      );

      res.json({
        success: true,
        data: audioResult,
      });
    } catch (error) {
      logger.error('Error generating lesson speech:', error);
      next(error);
    }
  }

  /**
   * Generate speech for quiz question
   */
  async generateQuizSpeech(req, res, next) {
    try {
      const { quizId, questionId } = req.body;
      const userId = req.user.id;

      // Get quiz question
      // Note: Implement quiz fetching logic
      const question = {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
      };

      // Get preferences
      const preferences = await VoicePreferences.getOrCreate(userId);

      const audioResult = await speechService.generateQuizAudio(
        question,
        preferences.language,
        preferences.voice,
        preferences.voiceSpeed,
        preferences.voicePitch
      );

      res.json({
        success: true,
        data: audioResult,
      });
    } catch (error) {
      logger.error('Error generating quiz speech:', error);
      next(error);
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Generate URL for uploaded avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Update preferences with new avatar URL
      const preferences = await VoicePreferences.findOneAndUpdate(
        { userId },
        { $set: { avatarUrl } },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: avatarUrl,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      next(error);
    }
  }

  /**
   * Save face preset
   */
  async saveFacePreset(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, avatarUrl, friendName } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Preset name is required',
        });
      }

      const preferences = await VoicePreferences.getOrCreate(userId);

      const preset = {
        id: Date.now().toString(),
        name: name.trim(),
        avatarUrl: avatarUrl || preferences.avatarUrl,
        friendName: friendName || preferences.customAvatarName || '',
        createdAt: new Date(),
      };

      await preferences.addFacePreset(preset);

      res.json({
        success: true,
        message: 'Face preset saved successfully',
        data: preset,
      });
    } catch (error) {
      logger.error('Error saving face preset:', error);
      next(error);
    }
  }

  /**
   * Delete face preset
   */
  async deleteFacePreset(req, res, next) {
    try {
      const userId = req.user.id;
      const { presetId } = req.params;

      const preferences = await VoicePreferences.getOrCreate(userId);
      await preferences.removeFacePreset(presetId);

      res.json({
        success: true,
        message: 'Face preset deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting face preset:', error);
      next(error);
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(req, res, next) {
    try {
      const { language } = req.query;
      const voices = language
        ? speechService.getAvailableVoices(language)
        : {
            en: speechService.getAvailableVoices('en'),
            hi: speechService.getAvailableVoices('hi'),
            ml: speechService.getAvailableVoices('ml'),
            kn: speechService.getAvailableVoices('kn'),
          };

      res.json({
        success: true,
        data: {
          voices,
          supportedLanguages: speechService.getSupportedLanguages(),
        },
      });
    } catch (error) {
      logger.error('Error fetching available voices:', error);
      next(error);
    }
  }
}

// Export controller instance and upload middleware
const voiceController = new VoiceController();
module.exports = {
  voiceController,
  uploadAvatar: upload.single('avatar'),
};
