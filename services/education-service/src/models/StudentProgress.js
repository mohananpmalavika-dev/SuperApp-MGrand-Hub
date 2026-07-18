const mongoose = require('mongoose');

const testScoreSchema = new mongoose.Schema({
  testId: mongoose.Schema.Types.ObjectId,
  testName: String,
  score: Number,
  totalMarks: Number,
  percentage: Number,
  timeTaken: Number, // in seconds
  completedAt: { type: Date, default: Date.now },
});

const topicProgressSchema = new mongoose.Schema({
  topic: String,
  questionsAttempted: { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // in minutes
  lastStudied: Date,
});

const studentProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  
  // Enrollment
  enrolledAt: { type: Date, default: Date.now },
  targetExamDate: Date,
  dailyGoalHours: { type: Number, default: 2 },
  
  // Progress
  completedLessons: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  }],
  completedChapters: [{
    moduleNumber: Number,
    chapterNumber: Number,
    completedAt: Date,
  }],
  currentModule: { type: Number, default: 1 },
  currentChapter: { type: Number, default: 1 },
  
  // Study stats
  totalTimeSpent: { type: Number, default: 0 }, // in minutes
  studyStreak: { type: Number, default: 0 }, // consecutive days
  lastStudyDate: Date,
  studyDates: [Date],
  
  // Performance
  overallAccuracy: { type: Number, default: 0 },
  testScores: [testScoreSchema],
  topicProgress: [topicProgressSchema],
  
  // Strengths and weaknesses
  strongTopics: [String],
  weakTopics: [String],
  needsRevision: [String],
  
  // Study plan
  studyPlan: {
    generated: Boolean,
    generatedAt: Date,
    totalDays: Number,
    currentDay: Number,
    phases: [{
      phaseName: String,
      startDay: Number,
      endDay: Number,
      focus: String,
    }],
  },
  
  // AI Recommendations
  aiRecommendations: {
    nextTopics: [String],
    focusAreas: [String],
    estimatedReadiness: Number, // percentage
    generatedAt: Date,
  },
  
  // Completion
  progressPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
}, {
  timestamps: true,
});

// Indexes
studentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
studentProgressSchema.index({ userId: 1 });

// Methods
studentProgressSchema.methods.updateProgress = function() {
  // Calculate progress percentage
  const course = this.courseId;
  if (course && course.modules) {
    const totalChapters = course.modules.reduce(
      (sum, m) => sum + m.chapters.length, 
      0
    );
    this.progressPercentage = Math.round(
      (this.completedChapters.length / totalChapters) * 100
    );
  }
  return this.save();
};

studentProgressSchema.methods.updateStudyStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.lastStudyDate ? new Date(this.lastStudyDate) : null;
  if (lastStudy) {
    lastStudy.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.studyStreak += 1;
    } else if (diffDays > 1) {
      this.studyStreak = 1;
    }
  } else {
    this.studyStreak = 1;
  }
  
  this.lastStudyDate = new Date();
  if (!this.studyDates.some(d => d.toDateString() === today.toDateString())) {
    this.studyDates.push(today);
  }
  
  return this.save();
};

studentProgressSchema.methods.addTestScore = function(testData) {
  this.testScores.push(testData);
  
  // Recalculate overall accuracy
  const recentScores = this.testScores.slice(-10); // Last 10 tests
  const avgPercentage = recentScores.reduce((sum, t) => sum + t.percentage, 0) / recentScores.length;
  this.overallAccuracy = Math.round(avgPercentage);
  
  return this.save();
};

studentProgressSchema.methods.updateTopicProgress = function(topic, correct, total, timeSpent) {
  let topicProg = this.topicProgress.find(t => t.topic === topic);
  
  if (!topicProg) {
    topicProg = {
      topic,
      questionsAttempted: 0,
      questionsCorrect: 0,
      accuracy: 0,
      timeSpent: 0,
    };
    this.topicProgress.push(topicProg);
  }
  
  topicProg.questionsAttempted += total;
  topicProg.questionsCorrect += correct;
  topicProg.accuracy = Math.round((topicProg.questionsCorrect / topicProg.questionsAttempted) * 100);
  topicProg.timeSpent += timeSpent;
  topicProg.lastStudied = new Date();
  
  // Update weak/strong topics
  if (topicProg.accuracy < 60 && topicProg.questionsAttempted >= 5) {
    if (!this.weakTopics.includes(topic)) {
      this.weakTopics.push(topic);
    }
    this.strongTopics = this.strongTopics.filter(t => t !== topic);
  } else if (topicProg.accuracy >= 80 && topicProg.questionsAttempted >= 5) {
    if (!this.strongTopics.includes(topic)) {
      this.strongTopics.push(topic);
    }
    this.weakTopics = this.weakTopics.filter(t => t !== topic);
  }
  
  return this.save();
};

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
