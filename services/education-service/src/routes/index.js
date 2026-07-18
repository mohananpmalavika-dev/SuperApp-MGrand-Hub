const express = require('express');
const router = express.Router();

// Import route modules
const courseRoutes = require('./courses');
const tutorRoutes = require('./tutor');
const testRoutes = require('./tests');
const progressRoutes = require('./progress');

// Mount routes
router.use('/courses', courseRoutes);
router.use('/tutor', tutorRoutes);
router.use('/tests', testRoutes);
router.use('/progress', progressRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'education-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

module.exports = router;
