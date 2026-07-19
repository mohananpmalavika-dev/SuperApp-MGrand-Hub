/**
 * CA Foundation Routes
 * Google Drive-based content delivery
 */

const express = require('express');
const router = express.Router();
const caFoundationController = require('../controllers/caFoundationController');

// Health check
router.get('/health', caFoundationController.healthCheck);

// Get all CA Foundation courses
router.get('/courses', caFoundationController.getAllCACourses);

// Get specific course with all lessons
router.get('/courses/:courseId', caFoundationController.getCACourseById);

// Get specific lesson by index
router.get('/courses/:courseId/lessons/:lessonIndex', caFoundationController.getCALesson);

// Get lesson by topic name
router.get('/courses/:courseId/topics/:topic', caFoundationController.getCALessonByTopic);

// Search CA content
router.get('/search', caFoundationController.searchCAContent);

// Get statistics
router.get('/stats', caFoundationController.getCAStatistics);

// Lesson-scoped tutor (content is reloaded from Drive before each answer)
router.post('/tutor/ask', caFoundationController.askLessonTutor);

// Admin routes (add authentication middleware as needed)
router.post('/cache/clear', caFoundationController.clearCache);
router.post('/refresh/:courseId', caFoundationController.refreshCourse);

module.exports = router;
