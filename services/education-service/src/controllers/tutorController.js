const ChatSession = require('../models/ChatSession');
const tutorEngine = require('../ai/tutor-engine');
const voiceManager = require('../tts/voice-manager');
const logger = require('../utils/logger');

/**
 * Ask question to AI tutor
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    logger.info('Student asking question', { userId: req.user.userId, question });

    const answer = await tutorEngine.answerQuestion(question, context || {});

    res.json({
      success: true,
      data: { question, answer },
    });
  } catch (error) {
    logger.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message,
    });
  }
};

/**
 * Start chat session
 */
exports.startChatSession = async (req, res) => {
  try {
    const { courseId, topic, subject, examType } = req.body;

    // Create new chat session
    const session = new ChatSession({
      studentId: req.user.userId,
      courseId,
      topic,
      subject,
      examType,
    });

    // Add welcome message
    await session.addMessage(
      'ai',
      `Hello! I'm your AI tutor for ${subject || 'all subjects'}. I'm here to help you prepare for ${examType || 'your exam'}. Feel free to ask me anything - doubts, concepts, problem-solving, or exam strategies. Let's learn together! 📚`
    );

    logger.info('Chat session started', { sessionId: session._id, userId: req.user.userId });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Start chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: error.message,
    });
  }
};

/**
 * Send message in chat session
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const session = await ChatSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    if (session.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Add student message
    await session.addMessage('student', message);

    // Get AI response
    const context = {
      subject: session.subject,
      topic: session.topic,
      examType: session.examType,
    };

    const aiResponse = await tutorEngine.answerQuestion(message, context);

    // Add AI message
    await session.addMessage('ai', aiResponse);

    res.json({
      success: true,
      data: {
        studentMessage: message,
        aiResponse,
        session,
      },
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Stream chat response (real-time)
 */
exports.streamChatResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const session = await ChatSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add student message
    await session.addMessage('student', message);

    // Stream AI response
    const context = {
      subject: session.subject,
      topic: session.topic,
      examType: session.examType,
    };

    let fullResponse = '';
    const stream = tutorEngine.streamAnswer(message, context);

    for await (const chunk of stream) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Add complete AI message to session
    await session.addMessage('ai', fullResponse);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    logger.error('Stream chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream response',
      error: error.message,
    });
  }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      studentId: req.user.userId,
      status: { $ne: 'abandoned' },
    })
      .select('-messages')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message,
    });
  }
};

/**
 * Get session by ID
 */
exports.getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message,
    });
  }
};

/**
 * End chat session
 */
exports.endChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { satisfaction } = req.body;

    const session = await ChatSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await session.endSession(satisfaction);

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: session,
    });
  } catch (error) {
    logger.error('End chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message,
    });
  }
};

/**
 * Upload voice question
 */
exports.voiceQuestion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file required',
      });
    }

    const context = req.body.context ? JSON.parse(req.body.context) : {};

    logger.info('Processing voice question', { userId: req.user.userId });

    // Process voice question
    const result = await voiceManager.processVoiceQuestion(req.file.path, context);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Voice question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice question',
      error: error.message,
    });
  }
};

/**
 * Get explanation for answer
 */
exports.explainAnswer = async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer } = req.body;

    if (!question || !studentAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question, student answer, and correct answer are required',
      });
    }

    const explanation = await tutorEngine.explainAnswer(
      question,
      studentAnswer,
      correctAnswer
    );

    res.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    logger.error('Explain answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explain answer',
      error: error.message,
    });
  }
};

/**
 * Get hints for a problem
 */
exports.getHints = async (req, res) => {
  try {
    const { question, difficulty } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const hints = await tutorEngine.generateHints(question, difficulty);

    res.json({
      success: true,
      data: hints,
    });
  } catch (error) {
    logger.error('Get hints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hints',
      error: error.message,
    });
  }
};
