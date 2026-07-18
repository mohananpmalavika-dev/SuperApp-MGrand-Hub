const mongoose = require('mongoose');

const testQuestionSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  questionNumber: Number,
  marks: Number,
  negativeMarks: Number,
});

const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  instructions: [String],
  duration: Number, // in minutes
  questions: [testQuestionSchema],
});

const testSchema = new mongoose.Schema({
  testTitle: { type: String, required: true },
  testType: {
    type: String,
    enum: ['MOCK', 'CHAPTER', 'TOPIC', 'ADAPTIVE', 'PREVIOUS_YEAR'],
    default: 'MOCK'
  },
  
  // Test details
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  examType: { type: String, required: true },
  subject: String,
  topic: String,
  
  // Configuration
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  passingMarks: Number,
  
  // Instructions
  instructions: [String],
  
  // Sections
  sections: [sectionSchema],
  
  // Difficulty
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Mixed'
  },
  
  // AI Generation
  aiGenerated: { type: Boolean, default: true },
  isAdaptive: { type: Boolean, default: false },
  generatedFor: mongoose.Schema.Types.ObjectId, // Student ID for adaptive tests
  
  // Stats
  attemptCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
}, {
  timestamps: true,
});

// Indexes
testSchema.index({ examType: 1, testType: 1 });
testSchema.index({ courseId: 1 });

module.exports = mongoose.model('Test', testSchema);
