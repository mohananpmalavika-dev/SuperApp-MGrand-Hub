const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiClient {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = 'gemini-2.5-flash';
    this.proModel = 'gemini-2.5-flash';
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
      responseMimeType,
      systemPrompt = 'You are an expert educator who creates clear, engaging, and accurate educational content.',
    } = options;

    try {
      const modelName = usePro ? this.proModel : this.model;
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${modelName}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            thinkingConfig: { thinkingBudget: 0 },
            ...(responseMimeType ? { responseMimeType } : {}),
          },
        }),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(
          response.error?.message || `Gemini request failed with ${apiResponse.status}`
        );
      }

      const content = response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('');
      if (!content) {
        throw new Error('Gemini returned no text content');
      }

      logger.info('Gemini API call successful', {
        model: modelName,
        finishReason: response.candidates?.[0]?.finishReason,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
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
        const retryMatch = error.message.match(/retry in ([\d.]+)s/i);
        const retryDelay = retryMatch
          ? Math.ceil(Number(retryMatch[1]) * 1000) + 1000
          : 1000 * attempt;

        if (attempt < this.maxRetries) {
          logger.warn(`Gemini API attempt ${attempt} failed; retrying after ${retryDelay}ms`);
          await this.delay(retryDelay);
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
      responseMimeType: 'application/json',
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

      try {
        return JSON.parse(cleanResponse);
      } catch {
        return JSON.parse(this.repairJSONString(cleanResponse));
      }
    } catch (error) {
      logger.error('Failed to parse JSON from Gemini response:', {
        responseLength: response.length,
        error: error.message,
      });
      throw new Error('Invalid JSON response from AI');
    }
  }

  repairJSONString(value) {
    let repaired = '';
    let inString = false;

    for (let index = 0; index < value.length; index++) {
      const character = value[index];

      if (!inString) {
        repaired += character;
        if (character === '"') inString = true;
        continue;
      }

      if (character === '"') {
        repaired += character;
        inString = false;
        continue;
      }

      if (character === '\\') {
        const next = value[index + 1];
        const validEscape = next && '"\\/bfnrt'.includes(next);
        const validUnicode =
          next === 'u' && /^[0-9a-fA-F]{4}$/.test(value.slice(index + 2, index + 6));

        if (validEscape || validUnicode) {
          repaired += character + next;
          index++;
        } else {
          repaired += '\\\\';
        }
        continue;
      }

      if (character === '\n') {
        repaired += '\\n';
      } else if (character === '\r') {
        repaired += '\\r';
      } else if (character === '\t') {
        repaired += '\\t';
      } else {
        repaired += character;
      }
    }

    return repaired;
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
