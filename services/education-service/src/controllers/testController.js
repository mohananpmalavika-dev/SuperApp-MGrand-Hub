const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const StudentProgress = require('../models/StudentProgress');
const contentGenerator = require('../ai/content-generator');
const logger = require('../utils/logger');

/**
 * Generate test questions
 */
exports.generateQuestions = async (req, res) => {
  try {
    const { topic, subject, examType, difficulty, count } = req.body;

    if (!topic || !subject || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and examType are required',
      });
    }

    logger.info('Generating questions', { topic, subject, examType, count });

    const questions = await contentGenerator.generateQuestions(
      topic,
      subject,
      examType,
      difficulty || 'Medium',
      count || 10
    );

    // Save questions to database
    const savedQuestions = await Question.insertMany(
      questions.map(q => ({
        ...q,
        examType,
        subject,
        topic,
        aiGenerated: true,
      }))
    );

    res.status(201).json({
      success: true,
      message: `Generated ${savedQuestions.length} questions`,
      data: savedQuestions,
    });
  } catch (error) {
    logger.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message,
    });
  }
};

/**
 * Generate adaptive test
 */
exports.generateAdaptiveTest = async (req, res) => {
  try {
    const { courseId, totalQuestions, subject } = req.body;

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

    logger.info('Generating adaptive test', { userId: req.user.userId, courseId });

    const studentProfile = {
      weakTopics: progress.weakTopics,
      strongTopics: progress.strongTopics,
      overallAccuracy: progress.overallAccuracy,
    };

    const testConfig = {
      totalQuestions: totalQuestions || 30,
      subject: subject || progress.courseId.subject,
      examType: progress.courseId.examType,
    };

    // Generate test with AI
    const testData = await contentGenerator.generateAdaptiveTest(
      studentProfile,
      testConfig
    );

    // Save questions first
    const allQuestions = [];
    testData.sections.forEach(section => {
      section.questions.forEach(q => {
        allQuestions.push({
          ...q,
          examType: testConfig.examType,
          subject: testConfig.subject,
          aiGenerated: true,
        });
      });
    });

    const savedQuestions = await Question.insertMany(allQuestions);

    // Create test
    const test = new Test({
      testTitle: testData.testTitle,
      testType: 'ADAPTIVE',
      courseId,
      examType: testConfig.examType,
      subject: testConfig.subject,
      totalQuestions: testData.totalQuestions,
      totalMarks: testData.sections.reduce((sum, s) => 
        sum + s.questions.reduce((qSum, q) => qSum + q.marks, 0), 0
      ),
      duration: testData.duration,
      instructions: testData.instructions,
      sections: testData.sections.map((section, sIdx) => ({
        sectionName: section.sectionName,
        questions: section.questions.map((q, qIdx) => ({
          questionId: savedQuestions[sIdx * section.questions.length + qIdx]._id,
          questionNumber: qIdx + 1,
          marks: q.marks || 1,
        })),
      })),
      isAdaptive: true,
      generatedFor: req.user.userId,
    });

    await test.save();

    logger.info('Adaptive test generated', { testId: test._id });

    res.status(201).json({
      success: true,
      message: 'Adaptive test generated successfully',
      data: test,
    });
  } catch (error) {
    logger.error('Generate adaptive test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate adaptive test',
      error: error.message,
    });
  }
};

/**
 * Get all tests
 */
exports.getAllTests = async (req, res) => {
  try {
    const { examType, testType, courseId } = req.query;

    const filter = { status: 'published' };
    if (examType) filter.examType = examType;
    if (testType) filter.testType = testType;
    if (courseId) filter.courseId = courseId;

    const tests = await Test.find(filter)
      .select('-sections')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    logger.error('Get all tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
      error: error.message,
    });
  }
};

/**
 * Get test by ID with questions
 */
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('sections.questions.questionId');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    logger.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test',
      error: error.message,
    });
  }
};

/**
 * Start test attempt
 */
exports.startTestAttempt = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Check if already attempted
    const attemptCount = await TestAttempt.countDocuments({
      studentId: req.user.userId,
      testId,
    });

    const attempt = new TestAttempt({
      studentId: req.user.userId,
      testId,
      courseId: test.courseId,
      attemptNumber: attemptCount + 1,
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      duration: test.duration,
      startedAt: new Date(),
    });

    await attempt.save();

    // Update test attempt count
    test.attemptCount += 1;
    await test.save();

    logger.info('Test attempt started', { attemptId: attempt._id, testId });

    res.status(201).json({
      success: true,
      message: 'Test attempt started',
      data: attempt,
    });
  } catch (error) {
    logger.error('Start test attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test attempt',
      error: error.message,
    });
  }
};

/**
 * Submit answer
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer, timeTaken } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found',
      });
    }

    if (attempt.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await attempt.submitAnswer(questionId, answer, timeTaken);

    res.json({
      success: true,
      message: 'Answer submitted',
      data: attempt,
    });
  } catch (error) {
    logger.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message,
    });
  }
};

/**
 * Submit test
 */
exports.submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found',
      });
    }

    if (attempt.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    attempt.submittedAt = new Date();
    attempt.timeTaken = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);

    // Calculate score
    await attempt.calculateScore();

    // Update student progress
    const progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId: attempt.courseId,
    });

    if (progress) {
      await progress.addTestScore({
        testId: attempt.testId,
        score: attempt.marksObtained,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
      });
    }

    logger.info('Test submitted', { attemptId, score: attempt.percentage });

    res.json({
      success: true,
      message: 'Test submitted successfully',
      data: attempt,
    });
  } catch (error) {
    logger.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test',
      error: error.message,
    });
  }
};

/**
 * Get my test attempts
 */
exports.getMyAttempts = async (req, res) => {
  try {
    const { courseId } = req.query;

    const filter = { studentId: req.user.userId };
    if (courseId) filter.courseId = courseId;

    const attempts = await TestAttempt.find(filter)
      .populate('testId', 'testTitle testType examType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    logger.error('Get my attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message,
    });
  }
};

/**
 * Get attempt by ID with detailed analysis
 */
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.id)
      .populate('testId')
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found',
      });
    }

    if (attempt.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    logger.error('Get attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt',
      error: error.message,
    });
  }
};
