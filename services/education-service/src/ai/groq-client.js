const Groq = require('groq-sdk');
const logger = require('../utils/logger');

class GroqClient {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.models = (
      process.env.GROQ_MODELS ||
      [
        'llama-3.1-8b-instant',
      ].join(',')
    )
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean);
    this.modelIndex = 0;
    this.maxRetries = this.models.length * 5;
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
      responseFormat,
      systemPrompt = 'You are an expert educator who creates clear, engaging, and accurate educational content.',
    } = options;

    try {
      const model = this.models[this.modelIndex];
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream,
        ...(responseFormat ? { response_format: responseFormat } : {}),
        ...(model.startsWith('qwen/')
          ? { reasoning_effort: 'none', reasoning_format: 'hidden' }
          : {}),
      });

      if (stream) {
        return response; // Return stream for real-time responses
      }

      const content = response.choices[0]?.message?.content;
      logger.info('Groq API call successful', {
        model,
        tokens: response.usage?.total_tokens,
      });
      this.modelIndex = (this.modelIndex + 1) % this.models.length;

      return content;
    } catch (error) {
      logger.error('Groq API error:', error);
      const wrappedError = new Error(`Groq API error: ${error.message}`);
      wrappedError.status = error.status;
      throw wrappedError;
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
        if (error.status === 429 || error.status === 404 || error.status === 400) {
          this.modelIndex = (this.modelIndex + 1) % this.models.length;
          if (attempt % this.models.length === 0 && attempt < this.maxRetries) {
            logger.warn('All Groq models are temporarily limited; waiting 30 seconds');
            await this.delay(30000);
          }
          continue;
        }
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
    let lastError;

    for (let attempt = 1; attempt <= this.models.length + 1; attempt++) {
      const response = await this.generateWithRetry(jsonPrompt, {
        ...options,
        temperature: 0.3,
        responseFormat: { type: 'json_object' },
      });

      try {
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.slice(7).trim();
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.slice(3).trim();
        }
        if (cleanResponse.endsWith('```')) {
          cleanResponse = cleanResponse.slice(0, -3).trim();
        }

        const firstBrace = cleanResponse.indexOf('{');
        const lastBrace = cleanResponse.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          cleanResponse = cleanResponse.slice(firstBrace, lastBrace + 1);
        }

        return JSON.parse(cleanResponse);
      } catch (error) {
        lastError = error;
        logger.warn(`Groq returned invalid JSON on attempt ${attempt}; rotating model`);
      }
    }

    throw new Error(`Invalid JSON response from AI: ${lastError?.message || 'parse failed'}`);
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
