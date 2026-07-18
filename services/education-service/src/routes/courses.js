const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/:id', optionalAuth, courseController.getCourseById);
router.get('/lesson/:id', optionalAuth, courseController.getLessonById);

// Protected routes
router.post('/generate', verifyToken, courseController.generateCourse);
router.post('/:courseId/generate-lesson', verifyToken, courseController.generateLesson);
router.post('/:courseId/enroll', verifyToken, courseController.enrollCourse);
router.get('/my/enrollments', verifyToken, courseController.getMyEnrollments);

module.exports = router;
