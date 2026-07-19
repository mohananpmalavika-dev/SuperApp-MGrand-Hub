const groqClient = require('./groq-client');
const geminiClient = require('./gemini-client');
const logger = require('../utils/logger');

/**
 * Smart AI Router - Uses best AI for each task
 * Groq: Fast responses, chat, real-time tutoring
 * Gemini: Long content, complex tasks, multimodal
 */
class AIRouter {
  constructor() {
    this.primaryAI = 'groq'; // Groq is faster for most tasks
    this.fallbackAI = 'gemini';
  }

  /**
   * Generate content with automatic fallback
   */
  async generate(prompt, options = {}) {
    try {
      // Use Groq for fast responses
      if (options.needSpeed || !options.usePro) {
        return await groqClient.generateWithRetry(prompt, options);
      }
      
      // Use Gemini Pro for complex tasks
      return await geminiClient.generateWithRetry(prompt, { ...options, usePro: true });
    } catch (error) {
      logger.warn(`Primary AI (${this.primaryAI}) failed, trying fallback...`);
      
      // Fallback to other AI
      try {
        if (this.primaryAI === 'groq') {
          return await geminiClient.generateWithRetry(prompt, options);
        } else {
          return await groqClient.generateWithRetry(prompt, options);
        }
      } catch (fallbackError) {
        logger.error('Both AI providers failed:', { error, fallbackError });
        throw new Error('All AI providers unavailable');
      }
    }
  }

  /**
   * Generate JSON with validation
   */
  async generateJSON(prompt, options = {}) {
    if (process.env.AI_PROVIDER === 'gemini') {
      return await geminiClient.generateJSON(prompt, options);
    }

    try {
      // Groq is better for structured output
      return await groqClient.generateJSON(prompt, {
        ...options,
        maxTokens: Math.min(options.maxTokens || 4096, 2500),
      });
    } catch (error) {
      logger.warn('Groq JSON generation failed, trying Gemini...');
      return await geminiClient.generateJSON(prompt, options);
    }
  }

  /**
   * Stream response (only Groq supports this efficiently)
   */
  async *generateStream(prompt, options = {}) {
    try {
      yield* groqClient.generateStream(prompt, options);
    } catch (error) {
      logger.error('Stream generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate with image (only Gemini supports this)
   */
  async generateWithImage(prompt, imageData, options = {}) {
    return await geminiClient.generateWithImage(prompt, imageData, options);
  }

  /**
   * Start chat session
   */
  async startChat(history = []) {
    // Use Gemini for chat sessions (better context handling)
    return await geminiClient.startChatSession(history);
  }

  /**
   * Health check for AI services
   */
  async healthCheck() {
    const health = {
      groq: false,
      gemini: false,
      timestamp: new Date(),
    };

    try {
      await groqClient.generate('Say OK', { maxTokens: 10 });
      health.groq = true;
    } catch (error) {
      logger.error('Groq health check failed:', error);
    }

    try {
      await geminiClient.generate('Say OK', { maxTokens: 10 });
      health.gemini = true;
    } catch (error) {
      logger.error('Gemini health check failed:', error);
    }

    return health;
  }
}

module.exports = new AIRouter();
