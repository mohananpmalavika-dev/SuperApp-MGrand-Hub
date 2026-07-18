const edgeTTS = require('./edge-tts-client');
const whisperSTT = require('./whisper-client');
const contentGenerator = require('../ai/content-generator');
const logger = require('../utils/logger');

/**
 * Voice Manager - Orchestrates TTS and STT operations
 */
class VoiceManager {
  /**
   * Convert lesson to audio lecture
   */
  async lessonToAudio(lessonContent, options = {}) {
    try {
      // Step 1: Generate lecture script from lesson
      logger.info('Generating lecture script from lesson');
      const script = await contentGenerator.generateLectureScript(lessonContent);

      // Step 2: Convert script to audio
      logger.info('Converting script to audio');
      const audioSegments = await edgeTTS.generateLectureAudio(script, options);

      return {
        script,
        audioSegments,
        totalDuration: audioSegments.reduce((sum, seg) => sum + seg.duration, 0),
      };
    } catch (error) {
      logger.error('Failed to convert lesson to audio:', error);
      throw error;
    }
  }

  /**
   * Generate audio for text content
   */
  async textToSpeech(text, options = {}) {
    try {
      const audio = await edgeTTS.generateSpeech(text, options);
      return audio;
    } catch (error) {
      logger.error('Text-to-speech failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe student voice question
   */
  async transcribeVoiceQuestion(audioPath, options = {}) {
    try {
      const transcription = await whisperSTT.transcribe(audioPath, options);
      
      // Clean up audio file after transcription
      const fs = require('fs').promises;
      await fs.unlink(audioPath).catch(() => {});

      return {
        text: transcription.text,
        language: transcription.language,
        confidence: transcription.segments?.[0]?.confidence || 1.0,
      };
    } catch (error) {
      logger.error('Voice transcription failed:', error);
      throw error;
    }
  }

  /**
   * Process voice question with AI answer
   */
  async processVoiceQuestion(audioPath, context = {}) {
    try {
      // Step 1: Transcribe audio to text
      logger.info('Transcribing voice question');
      const transcription = await this.transcribeVoiceQuestion(audioPath);

      // Step 2: Get AI answer
      logger.info('Getting AI answer for question:', transcription.text);
      const tutorEngine = require('../ai/tutor-engine');
      const answer = await tutorEngine.answerQuestion(transcription.text, context);

      // Step 3: Convert answer to speech
      logger.info('Converting answer to speech');
      const audioAnswer = await this.textToSpeech(answer, {
        voice: context.voice || process.env.TTS_VOICE,
      });

      return {
        question: {
          text: transcription.text,
          language: transcription.language,
        },
        answer: {
          text: answer,
          audio: audioAnswer,
        },
      };
    } catch (error) {
      logger.error('Failed to process voice question:', error);
      throw error;
    }
  }

  /**
   * Get available TTS voices
   */
  async getAvailableVoices() {
    try {
      const voices = await edgeTTS.getIndianVoices();
      return voices;
    } catch (error) {
      logger.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Check voice services health
   */
  async healthCheck() {
    const health = {
      tts: false,
      stt: false,
      timestamp: new Date(),
    };

    // Check TTS
    try {
      await edgeTTS.generateSpeech('Test', { 
        voice: 'en-IN-NeerjaNeural' 
      });
      health.tts = true;
    } catch (error) {
      logger.error('TTS health check failed:', error);
    }

    // Check STT
    try {
      health.stt = await whisperSTT.checkInstallation();
    } catch (error) {
      logger.error('STT health check failed:', error);
    }

    return health;
  }

  /**
   * Generate subtitle file (VTT) for video
   */
  async generateSubtitles(audioPath, options = {}) {
    try {
      const transcription = await whisperSTT.transcribeWithTimestamps(audioPath, options);

      // Convert to WebVTT format
      let vtt = 'WEBVTT\n\n';

      transcription.transcript.forEach((segment, index) => {
        const startTime = this.formatTime(segment.start);
        const endTime = this.formatTime(segment.end);
        
        vtt += `${index + 1}\n`;
        vtt += `${startTime} --> ${endTime}\n`;
        vtt += `${segment.text}\n\n`;
      });

      return {
        vtt,
        fullText: transcription.fullText,
        duration: transcription.duration,
      };
    } catch (error) {
      logger.error('Failed to generate subtitles:', error);
      throw error;
    }
  }

  /**
   * Format time for VTT (HH:MM:SS.mmm)
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
}

module.exports = new VoiceManager();
