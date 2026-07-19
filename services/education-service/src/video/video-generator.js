const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const slideGenerator = require('./slide-generator');
const edgeTTS = require('../tts/edge-tts-client');

const execFilePromise = promisify(execFile);

/**
 * Video Generator - Combines slides with audio to create video lectures
 */
class VideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/videos');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create videos directory:', error);
    }
  }

  /**
   * Generate complete video lecture from lesson content
   */
  async generateVideoLecture(lessonContent, options = {}) {
    const videoId = uuidv4();
    
    try {
      logger.info('Starting video generation', { topic: lessonContent.topic });

      // Step 1: Generate slides
      logger.info('Generating slides...');
      const slides = await slideGenerator.generateSlides(lessonContent);

      // Step 2: Generate audio narration (if not provided)
      let audioSegments = lessonContent.audioSegments;
      if (!audioSegments || audioSegments.length === 0) {
        logger.info('Generating audio narration...');
        const contentGenerator = require('../ai/content-generator');
        const script = await contentGenerator.generateLectureScript(lessonContent);
        audioSegments = await edgeTTS.generateLectureAudio(script, options);
      }

      // Step 3: Match slides with audio timing
      const timeline = this.createTimeline(slides, audioSegments);

      // Step 4: Combine slides and audio into video using ffmpeg
      logger.info('Combining slides and audio...');
      const videoUrl = await this.combineIntoVideo(timeline, videoId);

      logger.info('Video generated successfully', { videoUrl, videoId });

      return {
        videoId,
        videoUrl,
        slides,
        duration: timeline.reduce((sum, item) => sum + item.duration, 0),
        slidesCount: slides.length,
      };
    } catch (error) {
      logger.error('Video generation failed:', error);
      throw error;
    }
  }

  /**
   * Create timeline matching slides with audio
   */
  createTimeline(slides, audioSegments) {
    const timeline = [];
    
    // Distribute audio duration across slides
    const totalAudioDuration = audioSegments.reduce(
      (sum, segment) => sum + segment.duration,
      0
    );
    
    slides.forEach((slide, index) => {
      // Calculate slide duration based on type
      const baseDuration = slideGenerator.getSlideDuration(slide.type);
      
      // Adjust duration based on available audio
      const audioDuration = audioSegments[index]?.duration || baseDuration;
      const duration = Math.max(baseDuration, audioDuration);

      timeline.push({
        slide: slide.filepath,
        audio: audioSegments[index]?.path || null,
        duration,
        type: slide.type,
      });
    });

    return timeline;
  }

  /**
   * Combine slides and audio into video using ffmpeg
   */
  async combineIntoVideo(timeline, videoId) {
    const outputPath = path.join(this.outputDir, `video-${videoId}.mp4`);
    const concatFile = path.join(this.outputDir, `concat-${videoId}.txt`);

    try {
      // Create intermediate videos for each slide
      const intermediateVideos = [];

      for (let i = 0; i < timeline.length; i++) {
        const item = timeline[i];
        const tempVideo = path.join(
          this.outputDir,
          `temp-${videoId}-${i}.mp4`
        );

        // Create video from slide image with duration
        const args = [
          '-loop', '1',
          '-i', item.slide,
          '-t', item.duration.toString(),
          '-vf', 'scale=1920:1080',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-r', '30',
          tempVideo
        ];

        // Add audio if available
        if (item.audio) {
          args.splice(4, 0, '-i', item.audio);
          args.splice(args.length - 1, 0, '-c:a', 'aac', '-shortest');
        } else {
          args.splice(args.length - 1, 0, '-an'); // No audio
        }

        await execFilePromise('ffmpeg', args, { timeout: 120000 });
        intermediateVideos.push(tempVideo);
      }

      // Create concat file
      const concatContent = intermediateVideos
        .map((video) => `file '${video}'`)
        .join('\n');
      await fs.writeFile(concatFile, concatContent);

      // Concatenate all videos
      await execFilePromise(
        'ffmpeg',
        [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFile,
          '-c', 'copy',
          outputPath
        ],
        { timeout: 300000 }
      );

      // Clean up intermediate files
      for (const video of intermediateVideos) {
        await fs.unlink(video).catch(() => {});
      }
      await fs.unlink(concatFile).catch(() => {});

      logger.info('Video combined successfully', { outputPath });

      return `/api/education/videos/${path.basename(outputPath)}`;
    } catch (error) {
      logger.error('Failed to combine video:', error);
      throw error;
    }
  }

  /**
   * Generate quick video (faster, lower quality for preview)
   */
  async generateQuickVideo(lessonContent) {
    // Use fewer slides and lower quality for faster generation
    const slides = await slideGenerator.generateSlides(lessonContent);
    
    // Use first 5 slides only
    const quickSlides = slides.slice(0, 5);
    
    return await this.generateVideoLecture({
      ...lessonContent,
      quickMode: true,
    });
  }

  /**
   * Check if ffmpeg is installed
   */
  async checkFFmpegInstallation() {
    try {
      await execFilePromise('ffmpeg', ['-version']);
      return true;
    } catch (error) {
      logger.error('FFmpeg not installed');
      return false;
    }
  }
}

module.exports = new VideoGenerator();
