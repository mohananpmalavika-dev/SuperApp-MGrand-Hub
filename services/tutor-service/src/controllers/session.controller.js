const tutorService = require('../services/tutor.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');

/**
 * Start a new tutoring session
 */
exports.startSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const sessionData = req.body;

  const result = await tutorService.startSession(userId, sessionData);

  res.status(201).json(apiResponse.success(result, 'Session started successfully'));
});

/**
 * Get session details
 */
exports.getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const TutorSession = require('../models/TutorSession.model');

  const session = await TutorSession.findById(sessionId);
  
  if (!session) {
    return res.status(404).json(apiResponse.error('Session not found'));
  }

  // Check if user owns this session
  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  res.json(apiResponse.success(session, 'Session retrieved successfully'));
});

/**
 * Get user's sessions
 */
exports.getUserSessions = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const { status, subject, limit = 20, page = 1 } = req.query;
  const TutorSession = require('../models/TutorSession.model');

  const query = { userId };
  if (status) query.status = status;
  if (subject) query.subject = subject;

  const sessions = await TutorSession.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await TutorSession.countDocuments(query);

  res.json(apiResponse.success({
    sessions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Sessions retrieved successfully'));
});

/**
 * Update session progress
 */
exports.updateProgress = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sectionsCompleted, totalSections, currentSection, comprehensionScore, notes } = req.body;
  const TutorSession = require('../models/TutorSession.model');

  const session = await TutorSession.findById(sessionId);
  
  if (!session) {
    return res.status(404).json(apiResponse.error('Session not found'));
  }

  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  // Update progress
  if (sectionsCompleted !== undefined && totalSections !== undefined) {
    await session.updateProgress(sectionsCompleted, totalSections);
  }

  if (currentSection) {
    session.progress.currentSection = currentSection;
  }

  if (comprehensionScore !== undefined) {
    session.comprehensionScore = comprehensionScore;
  }

  if (notes) {
    session.notes.push({
      section: currentSection || 'general',
      content: notes,
    });
  }

  // Update last activity
  session.gamification.lastActivityDate = new Date();

  await session.save();

  res.json(apiResponse.success(session, 'Progress updated successfully'));
});

/**
 * Complete session
 */
exports.completeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { finalScore } = req.body;
  const TutorSession = require('../models/TutorSession.model');

  const session = await TutorSession.findById(sessionId);
  
  if (!session) {
    return res.status(404).json(apiResponse.error('Session not found'));
  }

  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  session.status = 'completed';
  session.endTime = new Date();
  if (finalScore !== undefined) {
    session.comprehensionScore = finalScore;
  }

  // Award points for completion
  const points = Math.round(10 + (session.comprehensionScore * 0.2)); // 10-30 points
  await session.addPoints(points);

  await session.save();

  // Get recommendation for next topic
  const recommendation = await tutorService.recommendNextTopic({
    subject: session.subject,
    currentTopic: session.topic,
    comprehensionScore: session.comprehensionScore,
    weakAreas: session.adaptiveMetrics.weakAreas,
  });

  res.json(apiResponse.success({
    session,
    pointsEarned: points,
    recommendation,
  }, 'Session completed successfully'));
});

/**
 * Pause session
 */
exports.pauseSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const TutorSession = require('../models/TutorSession.model');

  const session = await TutorSession.findById(sessionId);
  
  if (!session) {
    return res.status(404).json(apiResponse.error('Session not found'));
  }

  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  session.status = 'paused';
  await session.save();

  res.json(apiResponse.success(session, 'Session paused'));
});

/**
 * Resume session
 */
exports.resumeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const TutorSession = require('../models/TutorSession.model');

  const session = await TutorSession.findById(sessionId);
  
  if (!session) {
    return res.status(404).json(apiResponse.error('Session not found'));
  }

  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json(apiResponse.error('Unauthorized access'));
  }

  session.status = 'active';
  session.gamification.lastActivityDate = new Date();
  await session.save();

  res.json(apiResponse.success(session, 'Session resumed'));
});
