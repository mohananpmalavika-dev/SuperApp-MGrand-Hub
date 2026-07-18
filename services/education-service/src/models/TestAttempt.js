const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  questionNumber: Number,
  selectedAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  marksObtained: Number,
  timeTaken: Number, // in seconds
  isMarkedForReview: { type: Boolean, default: false },
});

const testAttemptSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  
  // Attempt details
  attemptNumber: { type: Number, default: 1 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  
  // Answers
  answers: [answerSchema],
  
  // Scoring
  totalQuestions: Number,
  attemptedQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skippedQuestions: { type: Number, default: 0 },
  
  marksObtained: { type: Number, default: 0 },
  totalMarks: Number,
  percentage: { type: Number, default: 0 },
  
  // Time
  duration: Number, // allocated in minutes
  timeTaken: Number, // actual time in seconds
  
  // Analysis
  subjectWise: [{
    subject: String,
    attempted: Number,
    correct: Number,
    accuracy: Number,
  }],
  difficultyWise: [{
    difficulty: String,
    attempted: Number,
    correct: Number,
    accuracy: Number,
  }],
  
  // Rank
  rank: Number,
  totalAttempts: Number,
  percentile: Number,
  
  // Status
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'evaluated'],
    default: 'in_progress'
  },
  
  // Feedback
  feedback: String,
  aiRecommendations: {
    strengths: [String],
    weaknesses: [String],
    suggestedTopics: [String],
    nextSteps: [String],
  },
}, {
  timestamps: true,
});

// Indexes
testAttemptSchema.index({ studentId: 1, testId: 1 });
testAttemptSchema.index({ studentId: 1, createdAt: -1 });
testAttemptSchema.index({ status: 1 });

// Methods
testAttemptSchema.methods.submitAnswer = function(questionId, answer, timeTaken) {
  const existingAnswer = this.answers.find(a => 
    a.questionId.toString() === questionId.toString()
  );
  
  if (existingAnswer) {
    existingAnswer.selectedAnswer = answer;
    existingAnswer.timeTaken = timeTaken;
  } else {
    this.answers.push({
      questionId,
      selectedAnswer: answer,
      timeTaken,
    });
  }
  
  this.attemptedQuestions = this.answers.filter(a => a.selectedAnswer).length;
  return this.save();
};

testAttemptSchema.methods.calculateScore = async function() {
  // Populate questions to get correct answers
  await this.populate('answers.questionId');
  
  let correct = 0;
  let wrong = 0;
  let totalMarks = 0;
  
  this.answers.forEach(answer => {
    const question = answer.questionId;
    answer.correctAnswer = question.correctAnswer;
    answer.isCorrect = answer.selectedAnswer === question.correctAnswer;
    
    if (answer.isCorrect) {
      correct++;
      answer.marksObtained = question.marks || 1;
      totalMarks += answer.marksObtained;
    } else if (answer.selectedAnswer) {
      wrong++;
      answer.marksObtained = -(question.negativeMarks || 0);
      totalMarks += answer.marksObtained;
    } else {
      answer.marksObtained = 0;
    }
  });
  
  this.correctAnswers = correct;
  this.wrongAnswers = wrong;
  this.skippedQuestions = this.totalQuestions - this.attemptedQuestions;
  this.marksObtained = totalMarks;
  this.percentage = Math.round((totalMarks / this.totalMarks) * 100);
  this.status = 'evaluated';
  
  return this.save();
};

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
