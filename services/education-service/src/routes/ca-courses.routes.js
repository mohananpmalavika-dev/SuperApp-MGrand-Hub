/**
 * CA Foundation Courses Routes
 * Serves courses from Google Drive
 */

const express = require('express');
const router = express.Router();
const driveCourseService = require('../services/drive-course.service');

/**
 * @route   GET /api/education/ca/courses
 * @desc    Get all CA Foundation courses
 * @access  Public
 */
router.get('/courses', async (req, res) => {
  try {
    const result = await driveCourseService.getCACourses();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/education/ca/courses/:courseId
 * @desc    Get course details with lessons
 * @access  Public
 */
router.get('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await driveCourseService.getCourseById(courseId);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Course not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/education/ca/courses/:courseId/lessons/:lessonIndex
 * @desc    Get specific lesson content
 * @access  Public
 */
router.get('/courses/:courseId/lessons/:lessonIndex', async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;
    const result = await driveCourseService.getLesson(courseId, parseInt(lessonIndex));
    res.json(result);
  } catch (error) {
    const status = error.message === 'Lesson not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/education/ca/search
 * @desc    Search CA courses
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }
    
    const result = await driveCourseService.searchCourses(q);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/education/ca/cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const result = driveCourseService.getCacheStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/education/ca/cache/clear
 * @desc    Clear cache
 * @access  Admin only (add auth middleware)
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const result = driveCourseService.clearCache();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
