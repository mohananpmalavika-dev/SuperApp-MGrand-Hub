const mongoose = require('mongoose');

const keyConceptSchema = new mongoose.Schema({
  concept: { type: String, required: true },
  definition: String,
  explanation: String,
});

const solvedExampleSchema = new mongoose.Schema({
  question: { type: String, required: true },
  solution: { type: String, required: true },
  keyTakeaway: String,
});

const commonMistakeSchema = new mongoose.Schema({
  mistake: { type: String, required: true },
  why: String,
  howToAvoid: String,
});

const practiceProblemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  answer: String,
  explanation: String,
});

const lessonSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  moduleNumber: { type: Number, required: true },
  chapterNumber: { type: Number, required: true },
  
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  duration: Number, // in minutes
  
  // Content
  introduction: { type: String, required: true },
  keyConcepts: [keyConceptSchema],
  detailedContent: { type: String, required: true }, // Markdown
  solvedExamples: [solvedExampleSchema],
  realWorldApplications: [String],
  commonMistakes: [commonMistakeSchema],
  practiceProblems: [practiceProblemSchema],
  
  // Quick Revision
  quickRevision: {
    summary: [String],
    formulas: [String],
    mnemonics: [String],
  },
  examTips: [String],
  
  // Media
  videoUrl: String,
  audioUrl: String,
  audioSegments: [{
    segmentNumber: Number,
    audioId: String,
    url: String,
    duration: Number,
  }],
  subtitlesUrl: String,
  thumbnailUrl: String,
  
  // AI Generation metadata
  aiGenerated: { type: Boolean, default: true },
  generatedBy: { type: String, default: 'groq-llama' },
  generatedAt: { type: Date, default: Date.now },
  
  // Stats
  viewCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  
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
lessonSchema.index({ courseId: 1, moduleNumber: 1, chapterNumber: 1 });
lessonSchema.index({ subject: 1, topic: 1 });

// Methods
lessonSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

lessonSchema.methods.markCompleted = function() {
  this.completionCount += 1;
  return this.save();
};

module.exports = mongoose.model('Lesson', lessonSchema);
