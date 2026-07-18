const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorSession',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  questions: [
    {
      questionId: { type: String, required: true },
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'fill-blank', 'coding', 'essay'],
        default: 'multiple-choice',
      },
      question: { type: String, required: true },
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      explanation: String,
      points: { type: Number, default: 5 },
      timeSpent: Number, // seconds
      difficulty: String,
      topic: String,
      tags: [String],
    },
  ],
  results: {
    score: { type: Number, min: 0, max: 100 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    skippedAnswers: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    timeSpent: Number, // seconds
    passed: Boolean,
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    insight: String,
  },
  adaptiveData: {
    recommendedNextDifficulty: String,
    weakTopics: [String],
    strongTopics: [String],
    suggestedReviewTopics: [String],
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  timeLimit: Number, // seconds
}, {
  timestamps: true,
});

// Indexes
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ subject: 1, topic: 1 });
quizSchema.index({ 'results.score': -1 });

// Calculate results before saving
quizSchema.pre('save', function (next) {
  if (this.status === 'completed' && this.questions.length > 0) {
    const correct = this.questions.filter((q) => q.isCorrect === true).length;
    const wrong = this.questions.filter((q) => q.isCorrect === false).length;
    const skipped = this.questions.filter((q) => q.isCorrect === undefined).length;
    const earned = this.questions.filter((q) => q.isCorrect === true).reduce((sum, q) => sum + (q.points || 0), 0);
    const total = this.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    this.results.correctAnswers = correct;
    this.results.wrongAnswers = wrong;
    this.results.skippedAnswers = skipped;
    this.results.earnedPoints = earned;
    this.results.totalPoints = total;
    this.results.score = total > 0 ? Math.round((earned / total) * 100) : 0;
    this.results.passed = this.results.score >= 70;

    if (this.endTime && this.startTime) {
      this.results.timeSpent = Math.round((this.endTime - this.startTime) / 1000);
    }
  }
  next();
});

// Method to add question answer
quizSchema.methods.submitAnswer = function (questionId, answer, isCorrect, timeSpent) {
  const question = this.questions.find((q) => q.questionId === questionId);
  if (question) {
    question.selectedAnswer = answer;
    question.isCorrect = isCorrect;
    question.timeSpent = timeSpent;
  }
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
