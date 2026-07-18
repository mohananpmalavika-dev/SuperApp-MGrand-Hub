const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
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
  },
  pathName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  milestones: [
    {
      title: { type: String, required: true },
      topic: { type: String, required: true },
      description: String,
      estimatedHours: Number,
      prerequisites: [String],
      resources: [
        {
          type: { type: String, enum: ['article', 'video', 'book', 'exercise', 'project'] },
          title: String,
          url: String,
          duration: Number,
        },
      ],
      completed: { type: Boolean, default: false },
      completedAt: Date,
      score: { type: Number, min: 0, max: 100 },
    },
  ],
  currentMilestone: {
    type: Number,
    default: 0,
  },
  progress: {
    completedMilestones: { type: Number, default: 0 },
    totalMilestones: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
    default: 'not-started',
  },
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  customizations: {
    pace: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
    focusAreas: [String],
    skipTopics: [String],
  },
}, {
  timestamps: true,
});

// Update progress when milestones change
learningPathSchema.pre('save', function (next) {
  const completed = this.milestones.filter((m) => m.completed).length;
  this.progress.completedMilestones = completed;
  this.progress.totalMilestones = this.milestones.length;
  this.progress.percentComplete = this.milestones.length > 0 
    ? Math.round((completed / this.milestones.length) * 100) 
    : 0;

  if (completed === this.milestones.length && this.milestones.length > 0) {
    this.status = 'completed';
    this.actualCompletionDate = new Date();
  } else if (completed > 0) {
    this.status = 'in-progress';
  }

  next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
