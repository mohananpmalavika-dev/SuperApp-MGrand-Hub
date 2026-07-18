const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  
  // Question details
  question: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MCQ', 'TRUE_FALSE', 'NUMERICAL', 'ESSAY', 'FILL_BLANK'],
    default: 'MCQ'
  },
  
  // For MCQ
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  correctAnswer: { type: String, required: true },
  
  // Metadata
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  examType: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  // Explanation
  explanation: { type: String, required: true },
  conceptTested: String,
  timeEstimate: Number, // in seconds
  examRelevance: String,
  commonMistake: String,
  
  // Marks
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  
  // AI Generation
  aiGenerated: { type: Boolean, default: true },
  generatedBy: { type: String, default: 'groq-llama' },
  generatedAt: { type: Date, default: Date.now },
  
  // Stats
  timesUsed: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  accuracyRate: { type: Number, default: 0 },
  
  // Quality
  verified: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'reported'], 
    default: 'active' 
  },
}, {
  timestamps: true,
});

// Indexes
questionSchema.index({ examType: 1, subject: 1, topic: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ status: 1 });

// Methods
questionSchema.methods.recordAttempt = function(isCorrect) {
  this.timesUsed += 1;
  this.totalAttempts += 1;
  if (isCorrect) {
    this.correctAttempts += 1;
  }
  this.accuracyRate = (this.correctAttempts / this.totalAttempts) * 100;
  return this.save();
};

module.exports = mongoose.model('Question', questionSchema);
