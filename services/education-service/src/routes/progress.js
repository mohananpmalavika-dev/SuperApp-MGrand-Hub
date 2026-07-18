const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

// Progress tracking
router.get('/:courseId', verifyToken, progressController.getProgress);
router.post('/lesson/:lessonId/complete', verifyToken, progressController.completeLesson);
router.post('/:courseId/chapter/complete', verifyToken, progressController.completeChapter);

// Study planning
router.post('/:courseId/study-plan', verifyToken, progressController.generateStudyPlan);
router.get('/:courseId/recommendations', verifyToken, progressController.getRecommendations);
router.get('/:courseId/analytics', verifyToken, progressController.getAnalytics);

module.exports = router;
