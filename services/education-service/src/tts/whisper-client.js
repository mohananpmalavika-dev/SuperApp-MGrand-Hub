const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Whisper STT Client - FREE speech-to-text using OpenAI Whisper
 * Self-hosted, no API key needed!
 * 
 * Note: Requires whisper to be installed:
 * pip install openai-whisper
 * or use faster-whisper: pip install faster-whisper
 */
class WhisperClient {
  constructor() {
    this.model = 'base'; // base model is good balance of speed/accuracy
    // Models: tiny, base, small, medium, large
    this.language = 'en';
    this.uploadDir = path.join(__dirname, '../../uploads/audio');
  }

  /**
   * Transcribe audio file to text
   * @param {string} audioPath - Path to audio file
   * @param {object} options - Transcription options
   * @returns {Promise<object>} Transcription result
   */
  async transcribe(audioPath, options = {}) {
    const {
      model = this.model,
      language = this.language,
      task = 'transcribe', // 'transcribe' or 'translate'
    } = options;

    try {
      logger.info('Starting Whisper transcription', { audioPath, model });

      const result = await this.runWhisper(audioPath, model, language, task);

      logger.info('Transcription completed', { 
        textLength: result.text.length,
        duration: result.duration 
      });

      return result;
    } catch (error) {
      logger.error('Whisper transcription failed:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Run Whisper command
   */
  async runWhisper(audioPath, model, language, task) {
    return new Promise((resolve, reject) => {
      const args = [
        audioPath,
        '--model', model,
        '--language', language,
        '--task', task,
        '--output_format', 'json',
        '--output_dir', this.uploadDir,
      ];

      const whisper = spawn('whisper', args);

      let stdout = '';
      let stderr = '';

      whisper.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        stderr += data.toString();
        // Whisper outputs progress to stderr
        logger.debug('Whisper progress:', data.toString());
      });

      whisper.on('close', async (code) => {
        if (code !== 0) {
          return reject(new Error(`Whisper exited with code ${code}: ${stderr}`));
        }

        try {
          // Read the generated JSON file
          const jsonPath = audioPath.replace(/\.[^.]+$/, '.json');
          const jsonContent = await fs.readFile(jsonPath, 'utf8');
          const result = JSON.parse(jsonContent);

          // Clean up JSON file
          await fs.unlink(jsonPath).catch(() => {});

          resolve({
            text: result.text || '',
            segments: result.segments || [],
            language: result.language || language,
            duration: result.duration || 0,
          });
        } catch (error) {
          reject(error);
        }
      });

      whisper.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Transcribe with timestamps (useful for video lessons)
   */
  async transcribeWithTimestamps(audioPath, options = {}) {
    const result = await this.transcribe(audioPath, options);

    // Format segments with timestamps
    const transcript = result.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
    }));

    return {
      fullText: result.text,
      transcript,
      language: result.language,
      duration: result.duration,
    };
  }

  /**
   * Quick transcription (using tiny model for speed)
   */
  async quickTranscribe(audioPath) {
    return await this.transcribe(audioPath, { model: 'tiny' });
  }

  /**
   * Accurate transcription (using larger model)
   */
  async accurateTranscribe(audioPath) {
    return await this.transcribe(audioPath, { model: 'small' });
  }

  /**
   * Check if Whisper is installed
   */
  async checkInstallation() {
    return new Promise((resolve) => {
      const whisper = spawn('whisper', ['--help']);
      
      whisper.on('close', (code) => {
        resolve(code === 0);
      });

      whisper.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      'en', 'hi', 'ta', 'te', 'ml', 'kn', 'mr', 'gu', 'bn', 'pa', // Indian languages
      'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', // Other common languages
    ];
  }

  /**
   * Detect language from audio
   */
  async detectLanguage(audioPath) {
    try {
      const result = await this.transcribe(audioPath, {
        model: 'tiny',
        language: 'auto',
      });

      return result.language;
    } catch (error) {
      logger.error('Language detection failed:', error);
      return 'en';
    }
  }
}

module.exports = new WhisperClient();
