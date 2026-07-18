const mongoose = require('mongoose');

/**
 * Voice Preferences Model
 * Stores user's voice/avatar preferences for the tutor service
 */
const voicePreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
    index: true,
  },
  // Voice settings
  voice: {
    type: String,
    enum: ['female-soft', 'male-calm', 'female-warm', 'male-energetic'],
    default: 'female-soft',
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ml', 'kn'],
    default: 'en',
  },
  voiceSpeed: {
    type: Number,
    min: 0.5,
    max: 2.0,
    default: 1.0,
  },
  voicePitch: {
    type: Number,
    min: 0.5,
    max: 2.0,
    default: 1.0,
  },
  autoPlayVoice: {
    type: Boolean,
    default: true,
  },
  autoSendVoiceTranscript: {
    type: Boolean,
    default: true,
  },
  // Avatar settings
  avatarUrl: {
    type: String,
    default: '',
  },
  customAvatarName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  // Saved face presets
  facePresets: [
    {
      id: String,
      name: String,
      avatarUrl: String,
      friendName: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  // Scenario/background preferences
  preferredScenario: {
    type: String,
    enum: ['room', 'park', 'beach', 'cafe', 'library', 'classroom'],
    default: 'room',
  },
  // AI tutor persona
  tutorPersona: {
    type: String,
    enum: ['supportive', 'motivational', 'mindful', 'playful', 'professional'],
    default: 'supportive',
  },
  // Session settings
  enableVoiceInput: {
    type: Boolean,
    default: true,
  },
  enableVoiceOutput: {
    type: Boolean,
    default: true,
  },
  showWaveformVisual: {
    type: Boolean,
    default: true,
  },
  // Accessibility
  useSubtitles: {
    type: Boolean,
    default: false,
  },
  highContrastMode: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Method to add face preset
voicePreferencesSchema.methods.addFacePreset = function (preset) {
  // Limit to 20 presets
  if (this.facePresets.length >= 20) {
    this.facePresets.shift(); // Remove oldest
  }
  this.facePresets.push(preset);
  return this.save();
};

// Method to remove face preset
voicePreferencesSchema.methods.removeFacePreset = function (presetId) {
  this.facePresets = this.facePresets.filter(p => p.id !== presetId);
  return this.save();
};

// Static method to get or create preferences
voicePreferencesSchema.statics.getOrCreate = async function (userId) {
  let prefs = await this.findOne({ userId });
  if (!prefs) {
    prefs = await this.create({ userId });
  }
  return prefs;
};

module.exports = mongoose.model('VoicePreferences', voicePreferencesSchema);
