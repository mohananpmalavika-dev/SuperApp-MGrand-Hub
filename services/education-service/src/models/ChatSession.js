const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['student', 'ai'], 
    required: true 
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  
  // For voice messages
  hasAudio: { type: Boolean, default: false },
  audioUrl: String,
  
  // For images (student uploading problem images)
  hasImage: { type: Boolean, default: false },
  imageUrl: String,
  
  // Metadata
  tokensUsed: Number,
  responseTime: Number, // milliseconds
});

const chatSessionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  
  // Session info
  topic: String,
  subject: String,
  examType: String,
  
  // Messages
  messages: [messageSchema],
  
  // Session stats
  totalMessages: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // in seconds
  studentSatisfaction: { type: Number, min: 1, max: 5 },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'completed', 'abandoned'], 
    default: 'active' 
  },
  
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
}, {
  timestamps: true,
});

// Indexes
chatSessionSchema.index({ studentId: 1, createdAt: -1 });
chatSessionSchema.index({ status: 1 });

// Methods
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    ...metadata,
  });
  this.totalMessages += 1;
  
  // Update duration
  if (this.messages.length > 1) {
    const firstMessage = this.messages[0].timestamp;
    const lastMessage = this.messages[this.messages.length - 1].timestamp;
    this.duration = Math.floor((lastMessage - firstMessage) / 1000);
  }
  
  return this.save();
};

chatSessionSchema.methods.endSession = function(satisfaction) {
  this.status = 'completed';
  this.endedAt = new Date();
  if (satisfaction) {
    this.studentSatisfaction = satisfaction;
  }
  return this.save();
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
