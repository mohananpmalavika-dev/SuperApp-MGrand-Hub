const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const execFilePromise = promisify(execFile);

/**
 * Edge TTS Client - FREE unlimited text-to-speech using Microsoft Edge voices
 * No API key needed!
 */
class EdgeTTSClient {
  constructor() {
    this.defaultVoice = process.env.TTS_VOICE || 'en-IN-NeerjaNeural';
    this.outputDir = path.join(__dirname, '../../uploads/audio');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create audio output directory:', error);
    }
  }

  /**
   * Generate speech from text
   * @param {string} text - Text to convert to speech
   * @param {object} options - TTS options
   * @returns {Promise<string>} Path to generated audio file
   */
  async generateSpeech(text, options = {}) {
    const {
      voice = this.defaultVoice,
      rate = '+0%',
      volume = '+0%',
      outputFormat = 'audio-24khz-48kbitrate-mono-mp3',
    } = options;

    const audioId = uuidv4();
    const outputPath = path.join(this.outputDir, `${audioId}.mp3`);
    const tempTextFile = path.join(this.outputDir, `${audioId}.txt`);

    try {
      // Write text to temp file (handles long text better)
      await fs.writeFile(tempTextFile, text, 'utf8');

      // Call edge-tts command line
      // Note: edge-tts must be installed: pip install edge-tts
      const args = [
        '-v', voice,
        '-f', tempTextFile,
        '--write-media', outputPath,
        '--rate', rate,
        '--volume', volume,
      ];

      logger.info('Generating speech with Edge TTS', { voice, textLength: text.length });

      await execFilePromise('edge-tts', args, { timeout: 60000 });

      // Clean up temp text file
      await fs.unlink(tempTextFile).catch(() => {});

      logger.info('Speech generated successfully', { outputPath, audioId });
      
      return {
        audioId,
        path: outputPath,
        url: `/api/education/audio/${audioId}.mp3`,
        duration: await this.getAudioDuration(outputPath),
      };
    } catch (error) {
      // Clean up on error
      await fs.unlink(tempTextFile).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
      
      logger.error('Edge TTS generation failed:', error);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Generate lecture audio with segments
   */
  async generateLectureAudio(script, options = {}) {
    // Parse script segments
    const segments = this.parseScriptSegments(script);
    
    const audioSegments = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      logger.info(`Generating segment ${i + 1}/${segments.length}`);
      
      try {
        const audio = await this.generateSpeech(segment.text, {
          ...options,
          rate: segment.rate || options.rate,
        });
        
        audioSegments.push({
          segmentNumber: i + 1,
          ...audio,
        });
      } catch (error) {
        logger.error(`Failed to generate segment ${i + 1}:`, error);
        // Continue with other segments
      }
    }

    return audioSegments;
  }

  /**
   * Parse script into segments for better TTS control
   */
  parseScriptSegments(script) {
    const segments = [];
    
    // Split by segment markers
    const parts = script.split(/\[SEGMENT-\d+\]/);
    
    for (const part of parts) {
      if (!part.trim()) continue;
      
      // Remove pause markers for TTS (they'll be handled in editing)
      const cleanText = part
        .replace(/\[PAUSE-SHORT\]/g, '... ')
        .replace(/\[PAUSE-LONG\]/g, '... ... ')
        .replace(/\[EMPHASIS\]/g, '')
        .replace(/\[SLOW\]/g, '')
        .trim();
      
      if (cleanText) {
        // Determine speaking rate from markers
        const rate = part.includes('[SLOW]') ? '-20%' : '+0%';
        
        segments.push({
          text: cleanText,
          rate,
        });
      }
    }
    
    return segments;
  }

  /**
   * Get available voices
   */
  async getAvailableVoices() {
    try {
      const { stdout } = await execFilePromise('edge-tts', ['--list-voices']);
      
      // Parse voice list
      const voices = stdout
        .split('\n')
        .filter(line => line.includes('Name:'))
        .map(line => {
          const name = line.match(/Name: (.+)/)?.[1];
          return name;
        })
        .filter(Boolean);

      return voices;
    } catch (error) {
      logger.error('Failed to get voice list:', error);
      return [];
    }
  }

  /**
   * Get Indian voices (for our use case)
   */
  async getIndianVoices() {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter(voice => voice.includes('en-IN'));
  }

  /**
   * Estimate audio duration (approximate)
   */
  async getAudioDuration(filePath) {
    try {
      const stats = await fs.stat(filePath);
      // Approximate: 1MB ≈ 60 seconds at 48kbps
      const durationSeconds = Math.round((stats.size / 1024 / 1024) * 60);
      return durationSeconds;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clean up old audio files (older than 24 hours)
   */
  async cleanupOldFiles() {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          logger.info('Cleaned up old audio file:', file);
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup audio files:', error);
    }
  }
}

module.exports = new EdgeTTSClient();
