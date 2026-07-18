const Groq = require('groq-sdk');
const logger = require('../utils/logger');

class GroqClient {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = 'llama-3.3-70b-versatile'; // Fast and free
    this.maxRetries = 3;
  }

  /**
   * Generate content using Groq API
   * @param {string} prompt - The prompt for AI
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated content
   */
  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      stream = false,
      systemPrompt = 'You are an expert educator who creates clear, engaging, and accurate educational content.',
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (stream) {
        return response; // Return stream for real-time responses
      }

      const content = response.choices[0]?.message?.content;
      logger.info('Groq API call successful', {
        model: this.model,
        tokens: response.usage?.total_tokens,
      });

      return content;
    } catch (error) {
      logger.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error.message}`);
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
        logger.warn(`Groq API attempt ${attempt} failed, retrying...`);
        
        if (attempt < this.maxRetries) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no additional text.`;
    const response = await this.generateWithRetry(jsonPrompt, {
      ...options,
      temperature: 0.5, // Lower temperature for structured output
    });

    try {
      // Clean response - remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      return JSON.parse(cleanResponse);
    } catch (error) {
      logger.error('Failed to parse JSON from Groq response:', { response, error });
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Stream response for real-time chat
   */
  async *generateStream(prompt, options = {}) {
    const stream = await this.generate(prompt, { ...options, stream: true });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new GroqClient();
