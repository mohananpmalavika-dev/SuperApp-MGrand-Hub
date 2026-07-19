const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const StudentProgress = require('../models/StudentProgress');
const contentGenerator = require('../ai/content-generator');
const logger = require('../utils/logger');

/**
 * Get all courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const { examType, level, subject, status = 'published' } = req.query;

    const filter = { status };
    if (examType) filter.examType = examType;
    if (level) filter.level = level;
    if (subject) filter.subject = subject;

    const courses = await Course.find(filter)
      .select('-modules.chapters.topics')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
};

/**
 * Get course by ID with full curriculum
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // If user is authenticated, get their progress
    let progress = null;
    if (req.user) {
      progress = await StudentProgress.findOne({
        userId: req.user.userId,
        courseId: course._id,
      });
    }

    res.json({
      success: true,
      data: {
        course,
        progress,
      },
    });
  } catch (error) {
    logger.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message,
    });
  }
};

/**
 * Generate new course with AI
 */
exports.generateCourse = async (req, res) => {
  try {
    const {
      subject,
      level,
      examType,
      courseTitle,
      modules: requestedModules,
    } = req.body;

    if (!subject || !level || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Subject, level, and examType are required',
      });
    }

    const slug = `${examType}-${subject}-${level}`
      .toLowerCase()
      .replace(/\s+/g, '-');

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return res.json({
        success: true,
        message: 'Existing course reused',
        data: existingCourse,
      });
    }

    logger.info('Generating course', {
      subject,
      level,
      examType,
      source: requestedModules?.length ? 'template' : 'ai',
    });

    const curriculum = requestedModules?.length
      ? {
          courseTitle: courseTitle || `${examType} - ${subject}`,
          description: `Complete ${subject} course for ${examType}`,
          totalDuration: requestedModules.length * 3,
          modules: requestedModules.map((module, index) => ({
            moduleNumber: index + 1,
            moduleName: module.title,
            description: module.description || module.title,
            duration: 3,
            prerequisites: [],
            chapters: [
              {
                chapterNumber: 1,
                chapterName: module.title,
                description: module.description || module.title,
                duration: 3,
                difficulty: 'Medium',
                learningObjectives: module.topics,
                topics: module.topics,
              },
            ],
          })),
        }
      : await contentGenerator.generateCurriculum(subject, level, examType);

    const modules = (curriculum.modules || []).map((module) => ({
      ...module,
      chapters: (module.chapters || []).map((chapter) => ({
        ...chapter,
        topics: (chapter.topics || []).map((topic) =>
          typeof topic === 'string' ? { name: topic } : topic
        ),
      })),
    }));

    const course = new Course({
      ...curriculum,
      subject,
      level,
      examType,
      modules,
      slug,
      aiGenerated: true,
      generatedBy: 'groq-llama-3.3-70b',
      generatedAt: new Date(),
    });

    await course.save();

    logger.info('Course generated successfully', { courseId: course._id });

    res.status(201).json({
      success: true,
      message: 'Course generated successfully',
      data: course,
    });
  } catch (error) {
    logger.error('Generate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course',
      error: error.message,
    });
  }
};

/**
 * Generate lesson content for a chapter
 */
exports.generateLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleNumber, chapterNumber, topic } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const existingLesson = await Lesson.findOne({
      courseId,
      moduleNumber,
      chapterNumber,
    });
    if (existingLesson) {
      return res.json({
        success: true,
        message: 'Existing lesson reused',
        data: existingLesson,
      });
    }

    logger.info('Generating lesson', { topic, courseId });

    // Generate lesson content with AI
    const lessonContent = await contentGenerator.generateLessonContent(
      topic,
      course.subject,
      course.level,
      course.examType
    );

    // Create lesson in database
    const lesson = new Lesson({
      courseId,
      moduleNumber,
      chapterNumber,
      ...lessonContent,
      aiGenerated: true,
      generatedBy: 'groq-llama-3.3-70b',
    });

    await lesson.save();

    // Update course chapter with lesson ID
    const module = course.modules.find(m => m.moduleNumber === moduleNumber);
    if (module) {
      const chapter = module.chapters.find(c => c.chapterNumber === chapterNumber);
      if (chapter) {
        chapter.lessonId = lesson._id;
        await course.save();
      }
    }

    logger.info('Lesson generated successfully', { lessonId: lesson._id });

    res.status(201).json({
      success: true,
      message: 'Lesson generated successfully',
      data: lesson,
    });
  } catch (error) {
    logger.error('Generate lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lesson',
      error: error.message,
    });
  }
};

/**
 * Get lesson by ID
 */
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Increment view count
    await lesson.incrementView();

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message,
    });
  }
};

/**
 * Enroll in course
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { targetExamDate, dailyGoalHours } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    let progress = await StudentProgress.findOne({
      userId: req.user.userId,
      courseId,
    });

    if (progress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Create progress record
    progress = new StudentProgress({
      userId: req.user.userId,
      courseId,
      targetExamDate,
      dailyGoalHours: dailyGoalHours || 2,
      enrolledAt: new Date(),
    });

    await progress.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    logger.info('Student enrolled', { userId: req.user.userId, courseId });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: progress,
    });
  } catch (error) {
    logger.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message,
    });
  }
};

/**
 * Get my enrolled courses
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await StudentProgress.find({
      userId: req.user.userId,
    })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    logger.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message,
    });
  }
};
