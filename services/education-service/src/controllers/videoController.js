const Lesson = require('../models/Lesson');
const videoGenerator = require('../video/video-generator');
const manimGenerator = require('../video/manim-generator');
const logger = require('../utils/logger');

/**
 * Generate video lecture for a lesson
 */
exports.generateVideoLecture = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { quality = 'standard' } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    logger.info('Generating video lecture', { lessonId, quality });

    // Generate video
    const video = quality === 'quick' 
      ? await videoGenerator.generateQuickVideo(lesson)
      : await videoGenerator.generateVideoLecture(lesson);

    // Update lesson with video URL
    lesson.videoUrl = video.videoUrl;
    await lesson.save();

    res.json({
      success: true,
      message: 'Video lecture generated successfully',
      data: video,
    });
  } catch (error) {
    logger.error('Generate video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate video lecture',
      error: error.message,
    });
  }
};

/**
 * Generate animation for accounting problem
 */
exports.generateAccountingAnimation = async (req, res) => {
  try {
    const { example } = req.body;

    if (!example || !example.question || !example.solution) {
      return res.status(400).json({
        success: false,
        message: 'Example with question and solution required',
      });
    }

    logger.info('Generating accounting animation');

    const animation = await manimGenerator.generateAccountingAnimation(example);

    res.json({
      success: true,
      message: 'Animation generated successfully',
      data: animation,
    });
  } catch (error) {
    logger.error('Generate animation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate animation',
      error: error.message,
    });
  }
};

/**
 * Generate math animation
 */
exports.generateMathAnimation = async (req, res) => {
  try {
    const { problem } = req.body;

    if (!problem || !problem.question || !problem.solution) {
      return res.status(400).json({
        success: false,
        message: 'Problem with question and solution required',
      });
    }

    logger.info('Generating math animation');

    const animation = await manimGenerator.generateMathAnimation(problem);

    res.json({
      success: true,
      message: 'Animation generated successfully',
      data: animation,
    });
  } catch (error) {
    logger.error('Generate math animation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate animation',
      error: error.message,
    });
  }
};

/**
 * Check video generation system health
 */
exports.checkVideoSystemHealth = async (req, res) => {
  try {
    const health = {
      ffmpeg: await videoGenerator.checkFFmpegInstallation(),
      manim: await manimGenerator.checkManimInstallation(),
      slideGenerator: true, // Always available
      timestamp: new Date(),
    };

    const allHealthy = Object.values(health).every(v => v === true || v instanceof Date);

    res.json({
      success: true,
      healthy: allHealthy,
      data: health,
      recommendations: {
        ffmpeg: health.ffmpeg ? null : 'Install ffmpeg: https://ffmpeg.org/download.html',
        manim: health.manim ? null : 'Install manim: pip install manim',
      },
    });
  } catch (error) {
    logger.error('Video health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
};
