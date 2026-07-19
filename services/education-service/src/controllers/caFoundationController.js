/**
 * CA Foundation Controller
 * Uses Google Drive for content storage instead of MongoDB
 */

const googleDriveService = require('../services/googleDriveService');
const logger = require('../utils/logger');

/**
 * Get all CA Foundation courses
 * @route GET /api/education/ca-foundation/courses
 */
exports.getAllCACourses = async (req, res) => {
  try {
    const { examType, subject } = req.query;
    
    const catalog = await googleDriveService.getCACourses();
    let courses = catalog.courses;

    // Apply filters
    if (examType) {
      courses = courses.filter(c => c.examType === examType);
    }
    if (subject) {
      courses = courses.filter(c => 
        c.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    logger.info('CA courses fetched', {
      total: courses.length,
      filters: { examType, subject }
    });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
      source: 'google-drive'
    });

  } catch (error) {
    logger.error('Get CA courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CA courses',
      error: error.message
    });
  }
};

/**
 * Get specific CA Foundation course with all lessons
 * @route GET /api/education/ca-foundation/courses/:courseId
 */
exports.getCACourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await googleDriveService.getCourseById(courseId);

    logger.info('CA course fetched', {
      courseId,
      lessonsCount: course.totalLessons
    });

    res.json({
      success: true,
      data: course,
      source: 'google-drive'
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        error: error.message
      });
    }

    logger.error('Get CA course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

/**
 * Get specific lesson from a course
 * @route GET /api/education/ca-foundation/courses/:courseId/lessons/:lessonIndex
 */
exports.getCALesson = async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;
    
    const lesson = await googleDriveService.getLesson(
      courseId, 
      parseInt(lessonIndex)
    );

    logger.info('CA lesson fetched', {
      courseId,
      lessonIndex,
      topic: lesson.topic
    });

    res.json({
      success: true,
      data: lesson,
      source: 'google-drive'
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
        error: error.message
      });
    }

    logger.error('Get CA lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

/**
 * Get lesson by topic name
 * @route GET /api/education/ca-foundation/courses/:courseId/topics/:topic
 */
exports.getCALessonByTopic = async (req, res) => {
  try {
    const { courseId, topic } = req.params;
    
    const lesson = await googleDriveService.getLessonByTopic(
      courseId,
      decodeURIComponent(topic)
    );

    logger.info('CA lesson by topic fetched', {
      courseId,
      topic: lesson.topic
    });

    res.json({
      success: true,
      data: lesson,
      source: 'google-drive'
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
        error: error.message
      });
    }

    logger.error('Get CA lesson by topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

/**
 * Search CA Foundation content
 * @route GET /api/education/ca-foundation/search
 */
exports.searchCAContent = async (req, res) => {
  try {
    const { q, query } = req.query;
    const searchQuery = q || query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required (use ?q=your-search or ?query=your-search)'
      });
    }

    const results = await googleDriveService.search(searchQuery);

    logger.info('CA content search', {
      query: searchQuery,
      coursesFound: results.courses.length,
      lessonsFound: results.lessons.length
    });

    res.json({
      success: true,
      query: searchQuery,
      results,
      source: 'google-drive'
    });

  } catch (error) {
    logger.error('Search CA content error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get CA Foundation statistics
 * @route GET /api/education/ca-foundation/stats
 */
exports.getCAStatistics = async (req, res) => {
  try {
    const stats = await googleDriveService.getStatistics();

    logger.info('CA statistics fetched', stats);

    res.json({
      success: true,
      data: stats,
      source: 'google-drive'
    });

  } catch (error) {
    logger.error('Get CA statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Clear cache (admin only)
 * @route POST /api/education/ca-foundation/cache/clear
 */
exports.clearCache = async (req, res) => {
  try {
    const { key } = req.body;
    
    googleDriveService.clearCache(key);

    logger.info('Cache cleared', { key: key || 'all' });

    res.json({
      success: true,
      message: key ? `Cache cleared for: ${key}` : 'All cache cleared'
    });

  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};

/**
 * Refresh specific course from Google Drive
 * @route POST /api/education/ca-foundation/refresh/:courseId
 */
exports.refreshCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Clear cache for this course
    googleDriveService.clearCache(`course_${courseId}`);
    
    // Fetch fresh data
    const course = await googleDriveService.getCourseById(courseId);

    logger.info('Course refreshed', {
      courseId,
      lessonsCount: course.totalLessons
    });

    res.json({
      success: true,
      message: 'Course refreshed successfully',
      data: course
    });

  } catch (error) {
    logger.error('Refresh course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh course',
      error: error.message
    });
  }
};

/**
 * Health check for Google Drive integration
 * @route GET /api/education/ca-foundation/health
 */
exports.healthCheck = async (req, res) => {
  try {
    const catalog = await googleDriveService.getCACourses();
    
    res.json({
      success: true,
      status: 'healthy',
      coursesAvailable: catalog.courses.length,
      mode: process.env.USE_LOCAL_CONTENT === 'true' ? 'LOCAL' : 'GOOGLE_DRIVE',
      googleDriveConfigured: !!process.env.GDRIVE_CA_FOUNDATION_FOLDER_ID,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
};
