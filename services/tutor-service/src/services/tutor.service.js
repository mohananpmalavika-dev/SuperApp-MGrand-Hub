const TutorSession = require('../models/TutorSession.model');
const LearningPath = require('../models/LearningPath.model');
const Quiz = require('../models/Quiz.model');
const logger = require('../../../packages/shared/src/logger');

/**
 * Tutor Service - Enhanced with AI-powered adaptive learning
 */
class TutorService {
  /**
   * Start a new tutoring session
   */
  async startSession(userId, sessionData) {
    try {
      const { subject, topic, difficulty, learningGoal, learningStyle } = sessionData;

      // Check for existing active session
      const existingSession = await TutorSession.findOne({
        userId,
        subject,
        topic,
        status: 'active',
      });

      if (existingSession) {
        return existingSession;
      }

      // Get user's learning history for adaptation
      const learningHistory = await this.getUserLearningHistory(userId, subject);
      
      // Determine appropriate difficulty if not specified
      const adaptedDifficulty = difficulty || await this.determineDifficulty(learningHistory);
      const detectedLearningStyle = learningStyle || await this.detectLearningStyle(userId);

      // Create new session
      const session = new TutorSession({
        userId,
        subject,
        topic,
        difficulty: adaptedDifficulty,
        learningGoal,
        learningStyle: detectedLearningStyle,
        status: 'active',
        startTime: new Date(),
        'gamification.lastActivityDate': new Date(),
      });

      await session.save();

      // Generate adaptive lesson content
      const lessonContent = await this.generateAdaptiveLesson({
        subject,
        topic,
        difficulty: adaptedDifficulty,
        learningStyle: detectedLearningStyle,
        learningGoal,
        previousProgress: learningHistory,
      });

      return {
        session,
        lessonContent,
        learningPath: await this.suggestLearningPath(userId, subject, topic),
      };
    } catch (error) {
      logger.error('Error starting tutor session:', error);
      throw error;
    }
  }

  /**
   * Generate adaptive lesson content based on user profile
   */
  async generateAdaptiveLesson(params) {
    const { subject, topic, difficulty, learningStyle, learningGoal, previousProgress } = params;

    // Build lesson structure based on learning style
    const sections = [];

    // Introduction (always included)
    sections.push({
      type: 'introduction',
      title: 'Welcome to ' + topic,
      content: this.generateIntroduction(subject, topic, learningGoal),
      duration: 5,
      interactive: false,
    });

    // Core content adapted to learning style
    if (learningStyle === 'visual') {
      sections.push({
        type: 'visual-content',
        title: 'Visual Concepts',
        content: this.generateVisualContent(subject, topic, difficulty),
        duration: 15,
        interactive: true,
        visualAids: this.getVisualAids(subject, topic),
      });
    } else if (learningStyle === 'auditory') {
      sections.push({
        type: 'audio-content',
        title: 'Audio Explanation',
        content: this.generateAudioContent(subject, topic, difficulty),
        duration: 15,
        interactive: true,
        audioResources: this.getAudioResources(subject, topic),
      });
    } else if (learningStyle === 'kinesthetic') {
      sections.push({
        type: 'hands-on',
        title: 'Interactive Practice',
        content: this.generateHandsOnContent(subject, topic, difficulty),
        duration: 20,
        interactive: true,
        exercises: this.getInteractiveExercises(subject, topic),
      });
    } else {
      // Balanced approach
      sections.push({
        type: 'core-concepts',
        title: 'Core Concepts',
        content: this.generateCoreContent(subject, topic, difficulty),
        duration: 15,
        interactive: true,
        examples: this.getExamples(subject, topic, 5),
      });
    }

    // Practice exercises
    sections.push({
      type: 'practice',
      title: 'Practice Exercises',
      content: this.generatePracticeExercises(subject, topic, difficulty),
      duration: 15,
      interactive: true,
    });

    // Summary and key takeaways
    sections.push({
      type: 'summary',
      title: 'Key Takeaways',
      content: this.generateSummary(subject, topic),
      duration: 5,
      interactive: false,
    });

    // Add adaptive reinforcement if needed
    if (previousProgress && previousProgress.weakAreas?.length > 0) {
      sections.push({
        type: 'reinforcement',
        title: 'Let\'s Strengthen Your Skills',
        content: this.generateReinforcementContent(subject, previousProgress.weakAreas),
        duration: 10,
        interactive: true,
      });
    }

    return {
      title: `${subject}: ${topic}`,
      subject,
      topic,
      difficulty,
      learningStyle,
      sections,
      totalDuration: sections.reduce((sum, s) => sum + s.duration, 0),
      prerequisites: this.getPrerequisites(subject, topic),
      learningObjectives: this.getLearningObjectives(subject, topic, difficulty),
      resources: this.getAdditionalResources(subject, topic),
    };
  }

  /**
   * Generate quiz with adaptive difficulty
   */
  async generateQuiz(userId, quizParams) {
    try {
      const { subject, topic, difficulty, questionCount = 10, sessionId } = quizParams;

      // Get user's performance history
      const performanceHistory = await this.getUserQuizHistory(userId, subject, topic);
      
      // Adapt question difficulty based on history
      const adaptedDifficulty = await this.adaptQuizDifficulty(performanceHistory, difficulty);

      const questions = [];

      for (let i = 0; i < questionCount; i++) {
        const question = this.generateQuestion(subject, topic, adaptedDifficulty, i);
        questions.push(question);
      }

      // Create quiz record
      const quiz = new Quiz({
        userId,
        sessionId,
        subject,
        topic,
        difficulty: adaptedDifficulty,
        questions,
        timeLimit: questionCount * 90, // 90 seconds per question
        startTime: new Date(),
        status: 'in-progress',
      });

      await quiz.save();

      return {
        quizId: quiz._id,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          type: q.type,
          question: q.question,
          options: q.options,
          points: q.points,
        })),
        timeLimit: quiz.timeLimit,
        totalQuestions: questionCount,
      };
    } catch (error) {
      logger.error('Error generating quiz:', error);
      throw error;
    }
  }

  /**
   * Evaluate quiz and provide feedback
   */
  async evaluateQuiz(quizId, answers) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Process each answer
      answers.forEach((answer) => {
        const question = quiz.questions.find((q) => q.questionId === answer.questionId);
        if (question) {
          const isCorrect = this.checkAnswer(question, answer.selectedAnswer);
          question.selectedAnswer = answer.selectedAnswer;
          question.isCorrect = isCorrect;
          question.timeSpent = answer.timeSpent || 0;
        }
      });

      quiz.status = 'completed';
      quiz.endTime = new Date();

      // Generate feedback
      const feedback = this.generateQuizFeedback(quiz);
      quiz.feedback = feedback;

      // Adaptive recommendations
      quiz.adaptiveData = await this.generateAdaptiveRecommendations(quiz);

      await quiz.save();

      // Update session if linked
      if (quiz.sessionId) {
        await this.updateSessionProgress(quiz.sessionId, quiz.results.score);
      }

      return {
        quizId: quiz._id,
        results: quiz.results,
        feedback: quiz.feedback,
        adaptiveData: quiz.adaptiveData,
        detailedAnswers: quiz.questions.map((q) => ({
          questionId: q.questionId,
          question: q.question,
          yourAnswer: q.selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: q.isCorrect,
          explanation: q.explanation,
        })),
      };
    } catch (error) {
      logger.error('Error evaluating quiz:', error);
      throw error;
    }
  }

  /**
   * Create personalized learning path
   */
  async createLearningPath(userId, pathData) {
    try {
      const { subject, pathName, description, difficulty, customizations } = pathData;

      // Generate milestones based on subject and difficulty
      const milestones = this.generateMilestones(subject, difficulty);

      const learningPath = new LearningPath({
        userId,
        subject,
        pathName,
        description,
        difficulty,
        milestones,
        customizations,
        status: 'not-started',
        progress: {
          totalMilestones: milestones.length,
        },
      });

      await learningPath.save();

      return learningPath;
    } catch (error) {
      logger.error('Error creating learning path:', error);
      throw error;
    }
  }

  /**
   * Get user dashboard with personalized insights
   */
  async getUserDashboard(userId) {
    try {
      // Get active sessions
      const activeSessions = await TutorSession.find({
        userId,
        status: 'active',
      }).limit(5).sort({ updatedAt: -1 });

      // Get recent quiz results
      const recentQuizzes = await Quiz.find({
        userId,
        status: 'completed',
      }).limit(10).sort({ createdAt: -1 });

      // Get learning paths
      const learningPaths = await LearningPath.find({
        userId,
        status: { $in: ['not-started', 'in-progress'] },
      }).limit(5);

      // Calculate statistics
      const stats = await this.calculateUserStats(userId);

      // Get recommendations
      const recommendations = await this.generateRecommendations(userId, activeSessions, recentQuizzes);

      // Get achievements
      const achievements = await this.getUserAchievements(userId);

      return {
        stats,
        activeSessions,
        recentQuizzes: recentQuizzes.map((q) => ({
          subject: q.subject,
          topic: q.topic,
          score: q.results.score,
          date: q.createdAt,
          passed: q.results.passed,
        })),
        learningPaths: learningPaths.map((lp) => ({
          pathName: lp.pathName,
          subject: lp.subject,
          progress: lp.progress.percentComplete,
          status: lp.status,
        })),
        recommendations,
        achievements,
      };
    } catch (error) {
      logger.error('Error fetching user dashboard:', error);
      throw error;
    }
  }

  // ========== HELPER METHODS ==========

  async getUserLearningHistory(userId, subject) {
    const sessions = await TutorSession.find({
      userId,
      subject,
      status: 'completed',
    }).sort({ createdAt: -1 }).limit(10);

    return {
      totalSessions: sessions.length,
      averageScore: sessions.reduce((sum, s) => sum + s.comprehensionScore, 0) / sessions.length || 0,
      weakAreas: this.extractWeakAreas(sessions),
      strongAreas: this.extractStrongAreas(sessions),
    };
  }

  async determineDifficulty(learningHistory) {
    if (!learningHistory || learningHistory.totalSessions === 0) {
      return 'beginner';
    }

    const avgScore = learningHistory.averageScore;
    if (avgScore >= 85) return 'advanced';
    if (avgScore >= 70) return 'intermediate';
    return 'beginner';
  }

  async detectLearningStyle(userId) {
    // Analyze user's interaction patterns
    // For now, return balanced
    return 'balanced';
  }

  extractWeakAreas(sessions) {
    // Extract topics where user scored below 70%
    const weakTopics = new Set();
    sessions.forEach((session) => {
      if (session.comprehensionScore < 70) {
        if (session.adaptiveMetrics.weakAreas) {
          session.adaptiveMetrics.weakAreas.forEach((area) => weakTopics.add(area));
        }
      }
    });
    return Array.from(weakTopics);
  }

  extractStrongAreas(sessions) {
    const strongTopics = new Set();
    sessions.forEach((session) => {
      if (session.comprehensionScore >= 85) {
        strongTopics.add(session.topic);
      }
    });
    return Array.from(strongTopics);
  }

  generateIntroduction(subject, topic, learningGoal) {
    return `Welcome to ${topic} in ${subject}! ${learningGoal ? `Your goal: ${learningGoal}. ` : ''}Let's start learning!`;
  }

  generateVisualContent(subject, topic, difficulty) {
    return `Visual explanation of ${topic} with diagrams and illustrations.`;
  }

  generateAudioContent(subject, topic, difficulty) {
    return `Audio-based explanation of ${topic}.`;
  }

  generateHandsOnContent(subject, topic, difficulty) {
    return `Interactive exercises for ${topic}.`;
  }

  generateCoreContent(subject, topic, difficulty) {
    return `Core concepts and principles of ${topic}.`;
  }

  generatePracticeExercises(subject, topic, difficulty) {
    return `Practice problems for ${topic}.`;
  }

  generateSummary(subject, topic) {
    return `Key takeaways from ${topic}.`;
  }

  generateReinforcementContent(subject, weakAreas) {
    return `Review content for: ${weakAreas.join(', ')}`;
  }

  getPrerequisites(subject, topic) {
    return [];
  }

  getLearningObjectives(subject, topic, difficulty) {
    return [
      `Understand the fundamentals of ${topic}`,
      `Apply concepts in practical scenarios`,
      `Master ${difficulty} level concepts`,
    ];
  }

  getAdditionalResources(subject, topic) {
    return [];
  }

  getVisualAids(subject, topic) {
    return [];
  }

  getAudioResources(subject, topic) {
    return [];
  }

  getInteractiveExercises(subject, topic) {
    return [];
  }

  getExamples(subject, topic, count) {
    return [];
  }

  async getUserQuizHistory(userId, subject, topic) {
    return await Quiz.find({
      userId,
      subject,
      topic,
      status: 'completed',
    }).sort({ createdAt: -1 }).limit(10);
  }

  async adaptQuizDifficulty(performanceHistory, requestedDifficulty) {
    if (!performanceHistory || performanceHistory.length === 0) {
      return requestedDifficulty || 'beginner';
    }

    const avgScore = performanceHistory.reduce((sum, quiz) => sum + quiz.results.score, 0) / performanceHistory.length;
    
    if (avgScore >= 90) return 'advanced';
    if (avgScore >= 75) return 'intermediate';
    return 'beginner';
  }

  generateQuestion(subject, topic, difficulty, index) {
    return {
      questionId: `q-${Date.now()}-${index}`,
      type: 'multiple-choice',
      question: `Sample question ${index + 1} about ${topic}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is a sample question.',
      difficulty,
      topic,
      points: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 7 : 10,
    };
  }

  checkAnswer(question, selectedAnswer) {
    return question.correctAnswer === selectedAnswer;
  }

  generateQuizFeedback(quiz) {
    const score = quiz.results.score;
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    if (score >= 90) {
      strengths.push('Excellent understanding of the topic');
      recommendations.push('Ready to move to advanced level');
    } else if (score >= 70) {
      strengths.push('Good grasp of core concepts');
      weaknesses.push('Some areas need reinforcement');
      recommendations.push('Practice more on weak topics');
    } else {
      weaknesses.push('Need to review fundamentals');
      recommendations.push('Revisit the lesson content');
    }

    return {
      strengths,
      weaknesses,
      recommendations,
      insight: score >= 90 ? '🎉 Outstanding!' : score >= 70 ? '👍 Good job!' : '📚 Keep practicing!',
    };
  }

  async generateAdaptiveRecommendations(quiz) {
    const score = quiz.results.score;
    const wrongQuestions = quiz.questions.filter((q) => q.isCorrect === false);
    const weakTopics = [...new Set(wrongQuestions.map((q) => q.topic))];

    return {
      recommendedNextDifficulty: score >= 85 ? 'advanced' : score >= 70 ? 'intermediate' : 'beginner',
      weakTopics,
      strongTopics: [...new Set(quiz.questions.filter((q) => q.isCorrect === true).map((q) => q.topic))],
      suggestedReviewTopics: weakTopics.slice(0, 3),
    };
  }

  async updateSessionProgress(sessionId, score) {
    const session = await TutorSession.findById(sessionId);
    if (session) {
      session.comprehensionScore = score;
      session.progress.sectionsCompleted += 1;
      await session.save();
    }
  }

  generateMilestones(subject, difficulty) {
    return [
      {
        title: 'Getting Started',
        topic: 'Fundamentals',
        description: 'Learn the basics',
        estimatedHours: 5,
        prerequisites: [],
        resources: [],
      },
    ];
  }

  async calculateUserStats(userId) {
    const totalSessions = await TutorSession.countDocuments({ userId });
    const completedSessions = await TutorSession.countDocuments({ userId, status: 'completed' });
    const totalQuizzes = await Quiz.countDocuments({ userId, status: 'completed' });
    const totalPoints = await TutorSession.getUserTotalPoints(userId);

    const quizzes = await Quiz.find({ userId, status: 'completed' });
    const avgQuizScore = quizzes.length > 0
      ? quizzes.reduce((sum, q) => sum + q.results.score, 0) / quizzes.length
      : 0;

    return {
      totalSessions,
      completedSessions,
      totalQuizzes,
      totalPoints,
      avgQuizScore: Math.round(avgQuizScore),
      learningStreak: 0, // Calculate based on daily activity
    };
  }

  async generateRecommendations(userId, activeSessions, recentQuizzes) {
    const recommendations = [];

    if (activeSessions.length === 0) {
      recommendations.push({
        type: 'start-learning',
        message: 'Start a new learning session today!',
        action: 'Start Session',
      });
    }

    if (recentQuizzes.length > 0) {
      const lastQuiz = recentQuizzes[0];
      if (lastQuiz.results.score < 70) {
        recommendations.push({
          type: 'review',
          message: `Review ${lastQuiz.topic} to improve your score`,
          action: 'Review Topic',
        });
      }
    }

    return recommendations;
  }

  async getUserAchievements(userId) {
    // Placeholder for achievements system
    return [];
  }

  async suggestLearningPath(userId, subject, topic) {
    // Suggest relevant learning paths
    return null;
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId) {
    try {
      const session = await TutorSession.findById(sessionId);
      return session;
    } catch (error) {
      logger.error('Error fetching session by ID:', error);
      throw error;
    }
  }
}

module.exports = new TutorService();
