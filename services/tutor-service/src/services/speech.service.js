const logger = require('../../../packages/shared/src/logger');

/**
 * Speech Service
 * Handles text-to-speech synthesis and voice generation
 */
class SpeechService {
  constructor() {
    this.voiceMap = {
      'en': {
        'female-soft': { lang: 'en-IN', pitch: 1.0, rate: 0.9 },
        'male-calm': { lang: 'en-IN', pitch: 0.8, rate: 0.9 },
        'female-warm': { lang: 'en-IN', pitch: 1.1, rate: 1.0 },
        'male-energetic': { lang: 'en-IN', pitch: 0.9, rate: 1.1 },
      },
      'hi': {
        'female-soft': { lang: 'hi-IN', pitch: 1.0, rate: 0.9 },
        'male-calm': { lang: 'hi-IN', pitch: 0.8, rate: 0.9 },
        'female-warm': { lang: 'hi-IN', pitch: 1.1, rate: 1.0 },
        'male-energetic': { lang: 'hi-IN', pitch: 0.9, rate: 1.1 },
      },
      'ml': {
        'female-soft': { lang: 'ml-IN', pitch: 1.0, rate: 0.9 },
        'male-calm': { lang: 'ml-IN', pitch: 0.8, rate: 0.9 },
        'female-warm': { lang: 'ml-IN', pitch: 1.1, rate: 1.0 },
        'male-energetic': { lang: 'ml-IN', pitch: 0.9, rate: 1.1 },
      },
      'kn': {
        'female-soft': { lang: 'kn-IN', pitch: 1.0, rate: 0.9 },
        'male-calm': { lang: 'kn-IN', pitch: 0.8, rate: 0.9 },
        'female-warm': { lang: 'kn-IN', pitch: 1.1, rate: 1.0 },
        'male-energetic': { lang: 'kn-IN', pitch: 0.9, rate: 1.1 },
      },
    };
  }

  /**
   * Get voice configuration for language and voice type
   */
  getVoiceConfig(language, voiceType) {
    const langVoices = this.voiceMap[language] || this.voiceMap['en'];
    return langVoices[voiceType] || langVoices['female-soft'];
  }

  /**
   * Generate speech synthesis markup (SSML) for better control
   */
  generateSSML(text, voiceConfig, customRate = 1.0, customPitch = 1.0) {
    const rate = (voiceConfig.rate * customRate).toFixed(2);
    const pitch = (voiceConfig.pitch * customPitch).toFixed(2);

    // Simple SSML structure
    return {
      text: text,
      ssml: `<speak><prosody rate="${rate}" pitch="${pitch}Hz">${text}</prosody></speak>`,
      lang: voiceConfig.lang,
      rate: parseFloat(rate),
      pitch: parseFloat(pitch),
    };
  }

  /**
   * Generate audio from text
   * Note: This is a placeholder for actual TTS API integration
   * In production, integrate with services like:
   * - Google Cloud Text-to-Speech
   * - Amazon Polly
   * - Azure Speech Services
   * - ElevenLabs
   */
  async generateAudio(text, language = 'en', voiceType = 'female-soft', customRate = 1.0, customPitch = 1.0) {
    try {
      const voiceConfig = this.getVoiceConfig(language, voiceType);
      const ssml = this.generateSSML(text, voiceConfig, customRate, customPitch);

      logger.info('Generating speech', {
        textLength: text.length,
        language,
        voiceType,
        voiceConfig: ssml.lang,
      });

      // ===== PLACEHOLDER FOR ACTUAL TTS API =====
      // Example with Google Cloud TTS:
      // const [response] = await textToSpeechClient.synthesizeSpeech({
      //   input: { text: text },
      //   voice: { languageCode: ssml.lang, name: voiceMapping[voiceType] },
      //   audioConfig: { audioEncoding: 'MP3', speakingRate: ssml.rate, pitch: ssml.pitch },
      // });
      // return { audio: response.audioContent.toString('base64'), mimeType: 'audio/mpeg' };

      // For now, return metadata for client-side Web Speech API
      return {
        audio: null, // Will be generated client-side
        mimeType: 'audio/mpeg',
        metadata: {
          text: text,
          language: ssml.lang,
          rate: ssml.rate,
          pitch: ssml.pitch,
          voiceType: voiceType,
          useClientSynthesis: true, // Flag for frontend to use Web Speech API
        },
        ssml: ssml.ssml,
      };

      // ===== END PLACEHOLDER =====
    } catch (error) {
      logger.error('Error generating audio:', error);
      throw new Error('Failed to generate speech audio');
    }
  }

  /**
   * Generate audio response for lesson content
   */
  async generateLessonAudio(lessonSection, language, voiceType, voiceSpeed = 1.0, voicePitch = 1.0) {
    try {
      const text = this.extractTextFromSection(lessonSection);
      return await this.generateAudio(text, language, voiceType, voiceSpeed, voicePitch);
    } catch (error) {
      logger.error('Error generating lesson audio:', error);
      throw error;
    }
  }

  /**
   * Generate audio for quiz questions
   */
  async generateQuizAudio(question, language, voiceType, voiceSpeed = 1.0, voicePitch = 1.0) {
    try {
      // Combine question and options into readable text
      let text = question.question + '. ';
      if (question.options && question.options.length > 0) {
        text += 'The options are: ';
        question.options.forEach((option, index) => {
          text += `Option ${String.fromCharCode(65 + index)}, ${option}. `;
        });
      }

      return await this.generateAudio(text, language, voiceType, voiceSpeed, voicePitch);
    } catch (error) {
      logger.error('Error generating quiz audio:', error);
      throw error;
    }
  }

  /**
   * Extract text content from lesson section
   */
  extractTextFromSection(section) {
    if (typeof section === 'string') {
      return section;
    }

    let text = '';
    if (section.title) {
      text += section.title + '. ';
    }
    if (section.content) {
      text += section.content + ' ';
    }
    if (section.summary) {
      text += section.summary + ' ';
    }

    return text.trim();
  }

  /**
   * Split long text into chunks for better TTS processing
   */
  splitTextIntoChunks(text, maxChunkLength = 1000) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    sentences.forEach((sentence) => {
      if ((currentChunk + sentence).length > maxChunkLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Get available voices for a language
   */
  getAvailableVoices(language) {
    const langVoices = this.voiceMap[language] || this.voiceMap['en'];
    return Object.keys(langVoices);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.voiceMap);
  }
}

module.exports = new SpeechService();
