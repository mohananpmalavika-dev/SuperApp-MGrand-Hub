const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const edgeTTS = require('edge-tts');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { createCanvas, loadImage } = require('canvas');
const logger = require('../utils/logger');

ffmpeg.setFfmpegPath(ffmpegPath);

class PDFContentGenerator {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Main processing pipeline
   */
  async processDocument(pdfPath, outputDir) {
    try {
      logger.info(`Starting PDF processing: ${pdfPath}`);

      // Step 1: Extract text from PDF
      const pdfText = await this.extractTextFromPDF(pdfPath);
      logger.info(`Extracted ${pdfText.length} characters from PDF`);

      // Step 2: Generate structured notes using AI
      const notes = await this.generateNotes(pdfText);
      logger.info(`Generated ${notes.sections.length} sections of notes`);

      // Step 3: Save notes to file
      const notesPath = path.join(outputDir, 'notes.json');
      await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));

      // Step 4: Generate audio narration
      const audioPath = await this.generateAudio(notes, outputDir);
      logger.info(`Generated audio narration: ${audioPath}`);

      // Step 5: Generate video with visuals
      const videoPath = await this.generateVideo(notes, audioPath, outputDir);
      logger.info(`Generated video: ${videoPath}`);

      return {
        success: true,
        notes: notesPath,
        audio: audioPath,
        video: videoPath,
        metadata: {
          title: notes.title,
          sections: notes.sections.length,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error(`PDF processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(pdfPath) {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  /**
   * Generate structured notes from PDF text using AI
   */
  async generateNotes(pdfText) {
    // Split into chunks if text is too large
    const maxChunkSize = 30000;
    const chunks = this.splitIntoChunks(pdfText, maxChunkSize);

    const allSections = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      logger.info(`Processing chunk ${i + 1}/${chunks.length}`);

      const prompt = `Analyze this educational content and create comprehensive study notes. 
Extract and organize the following:

1. Main title/topic
2. Section summaries (concise overview of each major section)
3. Key points (bullet points of important concepts)
4. Definitions (technical terms and their meanings)
5. Formulas and equations (if any)
6. Examples (practical applications or illustrations)

Format your response as valid JSON with this structure:
{
  "title": "Main Topic Title",
  "sections": [
    {
      "title": "Section Title",
      "summary": "Brief summary",
      "keyPoints": ["point 1", "point 2"],
      "definitions": [{"term": "term", "definition": "definition"}],
      "formulas": ["formula 1"],
      "examples": ["example 1"]
    }
  ]
}

Content to analyze:
${chunk}`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.sections) {
            allSections.push(...parsed.sections);
          }
        }
      } catch (error) {
        logger.error(`Error processing chunk ${i}: ${error.message}`);
        // Continue with other chunks
      }
    }

    // Combine all sections
    return {
      title: allSections[0]?.title || 'Study Notes',
      generatedAt: new Date().toISOString(),
      sections: allSections,
    };
  }

  /**
   * Split text into manageable chunks
   */
  splitIntoChunks(text, maxSize) {
    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
      if (currentChunk.length + line.length > maxSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
      }
      currentChunk += line + '\n';
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Generate audio narration from notes
   */
  async generateAudio(notes, outputDir) {
    // Create narration script
    const script = this.createNarrationScript(notes);

    // Generate audio using Edge TTS
    const audioPath = path.join(outputDir, 'narration.mp3');

    const tts = new edgeTTS.TTS();
    await tts.ttsToFile(audioPath, script, {
      voice: process.env.TTS_VOICE || 'en-US-JennyNeural',
      rate: '+0%',
      pitch: '+0Hz',
    });

    return audioPath;
  }

  /**
   * Create narration script from notes
   */
  createNarrationScript(notes) {
    let script = `Welcome to this lesson on ${notes.title}. Let's begin.\n\n`;

    for (const section of notes.sections) {
      script += `${section.title}.\n\n`;

      if (section.summary) {
        script += `${section.summary}\n\n`;
      }

      if (section.keyPoints && section.keyPoints.length > 0) {
        script += `The key points to remember are:\n`;
        section.keyPoints.forEach((point, index) => {
          script += `${index + 1}. ${point}\n`;
        });
        script += '\n';
      }

      if (section.definitions && section.definitions.length > 0) {
        script += `Let's define some important terms:\n`;
        section.definitions.forEach((def) => {
          script += `${def.term}: ${def.definition}\n`;
        });
        script += '\n';
      }

      if (section.examples && section.examples.length > 0) {
        script += `Here are some examples:\n`;
        section.examples.forEach((example, index) => {
          script += `Example ${index + 1}: ${example}\n`;
        });
        script += '\n';
      }
    }

    script += `This concludes our lesson on ${notes.title}. Thank you for learning with us.`;

    return script;
  }

  /**
   * Generate video with visuals and audio
   */
  async generateVideo(notes, audioPath, outputDir) {
    const videoPath = path.join(outputDir, 'lesson_video.mp4');

    // Generate slides for each section
    const slidePaths = await this.generateSlides(notes, outputDir);

    // Calculate duration for each slide based on audio
    const audioDuration = await this.getAudioDuration(audioPath);
    const slideDuration = audioDuration / slidePaths.length;

    // Create video from slides
    await this.createVideoFromSlides(slidePaths, audioPath, videoPath, slideDuration);

    // Clean up temporary slide images
    for (const slidePath of slidePaths) {
      await fs.unlink(slidePath).catch(() => {});
    }

    return videoPath;
  }

  /**
   * Generate slide images for each section
   */
  async generateSlides(notes, outputDir) {
    const slidePaths = [];
    const width = 1280;
    const height = 720;

    // Title slide
    const titleSlidePath = path.join(outputDir, 'slide_00_title.png');
    await this.createTitleSlide(notes.title, width, height, titleSlidePath);
    slidePaths.push(titleSlidePath);

    // Content slides
    for (let i = 0; i < notes.sections.length; i++) {
      const section = notes.sections[i];
      const slidePath = path.join(outputDir, `slide_${String(i + 1).padStart(2, '0')}.png`);
      await this.createContentSlide(section, width, height, slidePath);
      slidePaths.push(slidePath);
    }

    return slidePaths;
  }

  /**
   * Create title slide
   */
  async createTitleSlide(title, width, height, outputPath) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text if too long
    const lines = this.wrapText(ctx, title, width - 100);
    const lineHeight = 70;
    const startY = (height - lines.length * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * Create content slide
   */
  async createContentSlide(section, width, height, outputPath) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Section title
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(section.title, 50, 80);

    let y = 150;

    // Summary
    if (section.summary) {
      ctx.fillStyle = '#333333';
      ctx.font = '24px Arial';
      const summaryLines = this.wrapText(ctx, section.summary, width - 100);
      summaryLines.forEach((line) => {
        ctx.fillText(line, 50, y);
        y += 35;
      });
      y += 20;
    }

    // Key points
    if (section.keyPoints && section.keyPoints.length > 0) {
      ctx.fillStyle = '#1e3c72';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Key Points:', 50, y);
      y += 40;

      ctx.fillStyle = '#333333';
      ctx.font = '22px Arial';
      section.keyPoints.slice(0, 5).forEach((point) => {
        ctx.fillText('• ' + point, 70, y);
        y += 35;
      });
    }

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * Wrap text to fit within width
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Get audio duration in seconds
   */
  getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  /**
   * Create video from slides and audio
   */
  createVideoFromSlides(slidePaths, audioPath, outputPath, slideDuration) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add each slide as an input with duration
      slidePaths.forEach((slidePath) => {
        command.input(slidePath).inputOptions([`-loop 1`, `-t ${slideDuration}`]);
      });

      // Add audio
      command.input(audioPath);

      // Output options
      command
        .complexFilter([
          // Concatenate slides
          slidePaths.map((_, i) => `[${i}:v]`).join('') + `concat=n=${slidePaths.length}:v=1[outv]`,
        ])
        .outputOptions([
          '-map [outv]',
          `-map ${slidePaths.length}:a`,
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-shortest',
          '-pix_fmt yuv420p',
        ])
        .output(outputPath)
        .on('end', () => {
          logger.info('Video generation completed');
          resolve();
        })
        .on('error', (err) => {
          logger.error(`Video generation error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }
}

module.exports = PDFContentGenerator;
