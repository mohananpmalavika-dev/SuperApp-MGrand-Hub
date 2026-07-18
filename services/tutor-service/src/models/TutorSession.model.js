const mongoose = require('mongoose');

const tutorSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  learningGoal: {
    type: String,
    trim: true,
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'balanced'],
    default: 'balanced',
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active',
    index: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  totalDuration: {
    type: Number,
    default: 0, // in minutes
  },
  progress: {
    sectionsCompleted: { type: Number, default: 0 },
    totalSections: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    currentSection: { type: String },
  },
  comprehensionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  adaptiveMetrics: {
    adaptationCount: { type: Number, default: 0 },
    difficultyAdjustments: [
      {
        from: String,
        to: String,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    recommendedNextTopic: String,
    weakAreas: [String],
  },
  gamification: {
    pointsEarned: { type: Number, default: 0 },
    achievementsUnlocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorAchievement',
      },
    ],
    streakDays: { type: Number, default: 0 },
    lastActivityDate: Date,
  },
  notes: [
    {
      section: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  metadata: {
    deviceType: String,
    browser: String,
    location: String,
    referrer: String,
  },
}, {
  timestamps: true,
});

// Indexes for performance
tutorSessionSchema.index({ userId: 1, subject: 1, createdAt: -1 });
tutorSessionSchema.index({ status: 1, createdAt: -1 });
tutorSessionSchema.index({ 'gamification.pointsEarned': -1 });

// Calculate total duration before saving
tutorSessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    this.totalDuration = Math.round((this.endTime - this.startTime) / 60000); // minutes
  }
  next();
});

// Method to update progress
tutorSessionSchema.methods.updateProgress = function (sectionsCompleted, totalSections) {
  this.progress.sectionsCompleted = sectionsCompleted;
  this.progress.totalSections = totalSections;
  this.progress.percentComplete = totalSections > 0 ? Math.round((sectionsCompleted / totalSections) * 100) : 0;
  return this.save();
};

// Method to add points
tutorSessionSchema.methods.addPoints = function (points) {
  this.gamification.pointsEarned += points;
  return this.save();
};

// Static method to get user's total points
tutorSessionSchema.statics.getUserTotalPoints = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalPoints: { $sum: '$gamification.pointsEarned' } } },
  ]);
  return result[0]?.totalPoints || 0;
};

module.exports = mongoose.model('TutorSession', tutorSessionSchema);
