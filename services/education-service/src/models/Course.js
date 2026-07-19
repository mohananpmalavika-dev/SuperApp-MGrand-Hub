const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
});

const chapterSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  chapterName: { type: String, required: true },
  description: String,
  duration: Number, // in hours
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  learningObjectives: [String],
  topics: [topicSchema],
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  videoUrl: String,
  audioUrl: String,
  isCompleted: { type: Boolean, default: false },
});

const moduleSchema = new mongoose.Schema({
  moduleNumber: { type: Number, required: true },
  moduleName: { type: String, required: true },
  description: String,
  duration: Number, // in hours
  prerequisites: [String],
  chapters: [chapterSchema],
});

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  examType: { 
    type: String, 
    required: true,
    enum: [
      'CA_FOUNDATION', 'CA_INTERMEDIATE', 'CA_FINAL',
      'IAS_PRELIMS', 'IAS_MAINS',
      'JEE_MAIN', 'JEE_ADVANCED', 'NEET',
      'GATE', 'CAT', 'STATE_ENTRANCE', 'CBSE_CLASS_10'
    ]
  },
  subject: { type: String, required: true },
  level: { 
    type: String, 
    required: true,
    enum: ['FOUNDATION', 'INTERMEDIATE', 'ADVANCED']
  },
  description: String,
  totalDuration: Number, // in hours
  thumbnail: String,
  modules: [moduleSchema],
  
  // AI Generation metadata
  aiGenerated: { type: Boolean, default: true },
  generatedBy: { type: String, default: 'groq-llama' },
  generatedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  
  // Pricing
  price: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  
  // Stats
  enrollmentCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
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
courseSchema.index({ examType: 1, subject: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ status: 1 });

// Methods
courseSchema.methods.getChapterCount = function() {
  return this.modules.reduce((sum, module) => sum + module.chapters.length, 0);
};

courseSchema.methods.getTotalTopics = function() {
  let total = 0;
  this.modules.forEach(module => {
    module.chapters.forEach(chapter => {
      total += chapter.topics.length;
    });
  });
  return total;
};

module.exports = mongoose.model('Course', courseSchema);
