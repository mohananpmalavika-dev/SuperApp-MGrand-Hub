const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const driveContentService = require('../services/driveContentService');
const logger = require('../utils/logger');

/**
 * Routes for Google Drive-based content
 * 
 * These routes fetch content from Google Drive instead of MongoDB
 * Keeps MongoDB under 500MB limit
 */

/**
 * GET /api/education/drive/content/:fileId
 * Fetch full content from Google Drive file
 */
router.get('/content/:fileId', optionalAuth, async (req, res) => {
  try {
    const { fileId } = req.params;

    logger.info('Fetching Drive content', { fileId, userId: req.user?.userId });

    const content = await driveContentService.fetchContent(fileId);

    res.json({
      success: true,
      data: content,
      source: 'google-drive',
      cached: false // TODO: Check if from cache
    });

  } catch (error) {
    logger.error('Error fetching Drive content', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content from Google Drive',
      error: error.message
    });
  }
});

/**
 * GET /api/education/drive/lesson/:fileId/:lessonIndex
 * Fetch specific lesson from Google Drive file
 */
router.get('/lesson/:fileId/:lessonIndex', optionalAuth, async (req, res) => {
  try {
    const { fileId, lessonIndex } = req.params;
    const index = parseInt(lessonIndex, 10);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson index'
      });
    }

    logger.info('Fetching Drive lesson', { fileId, lessonIndex: index, userId: req.user?.userId });

    const lesson = await driveContentService.fetchLesson(fileId, index);

    res.json({
      success: true,
      data: lesson,
      source: 'google-drive',
      lessonIndex: index
    });

  } catch (error) {
    logger.error('Error fetching Drive lesson', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson from Google Drive',
      error: error.message
    });
  }
});

/**
 * GET /api/education/drive/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', optionalAuth, async (req, res) => {
  try {
    const stats = driveContentService.getCacheStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting cache stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

/**
 * POST /api/education/drive/cache/clear
 * Clear content cache
 */
router.post('/cache/clear', optionalAuth, async (req, res) => {
  try {
    driveContentService.clearCache();

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing cache', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

/**
 * POST /api/education/drive/cache/clean
 * Clean expired cache entries
 */
router.post('/cache/clean', optionalAuth, async (req, res) => {
  try {
    const cleaned = driveContentService.cleanExpiredCache();

    res.json({
      success: true,
      message: `Cleaned ${cleaned} expired cache entries`,
      cleaned
    });

  } catch (error) {
    logger.error('Error cleaning cache', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clean cache',
      error: error.message
    });
  }
});

module.exports = router;
