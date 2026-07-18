const StudentProgress = require('../models/StudentProgress');
const Lesson = require('../models/Lesson');
const contentGenerator = require('../ai/content-generator');
const tutorEngine = require('../ai/tutor-engine');
const logger = require('../utils/logger');

/**
 * Get student progress for a course
 */
exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    }).populate('courseId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message,
    });
  }
};

/**
 * Mark lesson as completed
 */
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { timeSpent } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId: lesson.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Add to completed lessons if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      await lesson.markCompleted();
    }

    // Update time spent
    progress.totalTimeSpent += timeSpent || 0;

    // Update study streak
    await progress.updateStudyStreak();

    // Update progress percentage
    await progress.updateProgress();

    await progress.save();

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: progress,
    });
  } catch (error) {
    logger.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as completed',
      error: error.message,
    });
  }
};

/**
 * Mark chapter as completed
 */
exports.completeChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleNumber, chapterNumber } = req.body;

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Add to completed chapters if not already there
    const existing = progress.completedChapters.find(
      c => c.moduleNumber === moduleNumber && c.chapterNumber === chapterNumber
    );

    if (!existing) {
      progress.completedChapters.push({
        moduleNumber,
        chapterNumber,
        completedAt: new Date(),
      });
    }

    await progress.updateProgress();

    res.json({
      success: true,
      message: 'Chapter marked as completed',
      data: progress,
    });
  } catch (error) {
    logger.error('Complete chapter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark chapter as completed',
      error: error.message,
    });
  }
};

/**
 * Generate personalized study plan
 */
exports.generateStudyPlan = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { examDate, dailyHours } = req.body;

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    }).populate('courseId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    logger.info('Generating study plan', { userId: req.user.userId, courseId });

    const studentProfile = {
      examType: progress.courseId.examType,
      examDate: examDate || progress.targetExamDate,
      dailyHours: dailyHours || progress.dailyGoalHours,
      weakTopics: progress.weakTopics,
      completedTopics: progress.completedLessons.map(l => l.topic),
      currentLevel: progress.courseId.level,
    };

    // Generate AI study plan
    const studyPlan = await contentGenerator.generateStudyPlan(studentProfile);

    // Save to progress
    progress.studyPlan = {
      generated: true,
      generatedAt: new Date(),
      ...studyPlan,
    };

    await progress.save();

    res.json({
      success: true,
      message: 'Study plan generated successfully',
      data: studyPlan,
    });
  } catch (error) {
    logger.error('Generate study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate study plan',
      error: error.message,
    });
  }
};

/**
 * Get AI recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    logger.info('Generating recommendations', { userId: req.user.userId });

    const studentProfile = {
      recentScores: progress.testScores.slice(-5).map(t => t.percentage),
      weakTopics: progress.weakTopics,
      strongTopics: progress.strongTopics,
      studyTime: progress.totalTimeSpent / 60 / 24, // Convert to hours per day
      examDate: progress.targetExamDate,
      lastActive: progress.lastStudyDate,
    };

    // Get AI recommendations
    const recommendations = await tutorEngine.getRecommendations(studentProfile);

    // Save to progress
    progress.aiRecommendations = {
      ...recommendations,
      generatedAt: new Date(),
    };

    await progress.save();

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    });
  }
};

/**
 * Get study analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    }).populate('courseId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Calculate analytics
    const analytics = {
      overview: {
        totalTimeSpent: progress.totalTimeSpent,
        studyStreak: progress.studyStreak,
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons.length,
        completedChapters: progress.completedChapters.length,
      },
      performance: {
        overallAccuracy: progress.overallAccuracy,
        recentScores: progress.testScores.slice(-10),
        strongTopics: progress.strongTopics,
        weakTopics: progress.weakTopics,
      },
      topicWise: progress.topicProgress.map(tp => ({
        topic: tp.topic,
        accuracy: tp.accuracy,
        questionsAttempted: tp.questionsAttempted,
        timeSpent: tp.timeSpent,
      })),
      studyPattern: {
        studyDates: progress.studyDates.slice(-30), // Last 30 days
        averageDailyTime: progress.totalTimeSpent / progress.studyDates.length || 0,
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
