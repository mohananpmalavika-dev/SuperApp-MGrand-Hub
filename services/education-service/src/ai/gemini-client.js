const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiClient {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = 'gemini-1.5-flash'; // Fast and free (2M tokens/min)
    this.proModel = 'gemini-1.5-pro'; // More capable for complex tasks
    this.maxRetries = 3;
  }

  /**
   * Generate content using Gemini API
   * @param {string} prompt - The prompt for AI
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated content
   */
  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 8192,
      usePro = false,
      systemPrompt = 'You are an expert educator who creates clear, engaging, and accurate educational content.',
    } = options;

    try {
      const model = this.client.getGenerativeModel({
        model: usePro ? this.proModel : this.model,
      });

      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const response = result.response;
      const content = response.text();

      logger.info('Gemini API call successful', {
        model: usePro ? this.proModel : this.model,
      });

      return content;
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate with retry logic
   */
  async generateWithRetry(prompt, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.generate(prompt, options);
      } catch (error) {
        lastError = error;
        logger.warn(`Gemini API attempt ${attempt} failed, retrying...`);
        
        if (attempt < this.maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no additional text or markdown.`;
    const response = await this.generateWithRetry(jsonPrompt, {
      ...options,
      temperature: 0.5,
    });

    try {
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      return JSON.parse(cleanResponse);
    } catch (error) {
      logger.error('Failed to parse JSON from Gemini response:', { response, error });
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Generate with images (multimodal)
   */
  async generateWithImage(prompt, imageData, options = {}) {
    try {
      const model = this.client.getGenerativeModel({
        model: options.usePro ? this.proModel : this.model,
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: 'image/jpeg',
          },
        },
      ]);

      return result.response.text();
    } catch (error) {
      logger.error('Gemini multimodal error:', error);
      throw new Error(`Gemini multimodal error: ${error.message}`);
    }
  }

  /**
   * Chat session for conversational AI
   */
  async startChatSession(history = []) {
    const model = this.client.getGenerativeModel({
      model: this.model,
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    return chat;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new GeminiClient();
