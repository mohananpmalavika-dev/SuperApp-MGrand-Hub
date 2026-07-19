const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');
const { createCanvas, registerFont } = require('canvas');
const ffmpeg = require('fluent-ffmpeg');

class PDFContentGenerator {
  constructor() {
    this.ttsClient = new textToSpeech.TextToSpeechClient();
  }

  /**
   * Extract text content from PDF
   */
  async extractPDFContent(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Parse and structure the content into sections
   */
  parseContent(text) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
      // Detect headers (UNIT, numbered sections, etc.)
      if (this.isHeader(line)) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        currentSection = {
          title: line.trim(),
          level: this.getHeaderLevel(line),
          content: ''
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    // Add last section
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n')
      });
    }

    return sections;
  }

  isHeader(line) {
    const headerPatterns = [
      /^UNIT\s+[-–]\s+\d+/i,
      /^\d+\.\d+\s+[A-Z]/,
      /^[A-Z\s]{10,}$/,
      /^LEARNING OUTCOMES/i,
      /^ILLUSTRATION\s+\d+/i
    ];
    
    return headerPatterns.some(pattern => pattern.test(line.trim()));
  }

  getHeaderLevel(line) {
    if (/^UNIT/.test(line)) return 1;
    if (/^\d+\.\d+\s/.test(line)) return 2;
    if (/^ILLUSTRATION/.test(line)) return 3;
    return 4;
  }

  /**
   * Generate structured notes
   */
  async generateNotes(sections) {
    const notes = {
      title: 'Issue of Debentures - Study Notes',
      generatedAt: new Date().toISOString(),
      sections: []
    };

    sections.forEach(section => {
      const noteSection = {
        title: section.title,
        summary: this.generateSummary(section.content),
        keyPoints: this.extractKeyPoints(section.content),
        definitions: this.extractDefinitions(section.content),
        formulas: this.extractFormulas(section.content),
        examples: this.extractExamples(section.content)
      };

      notes.sections.push(noteSection);
    });

    return notes;
  }

  generateSummary(content) {
    // Extract first few sentences as summary
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 3).join(' ').trim();
  }

  extractKeyPoints(content) {
    const points = [];
    const bulletPoints = content.match(/^[•♦\-]\s+.+$/gm) || [];
    
    bulletPoints.forEach(point => {
      points.push(point.replace(/^[•♦\-]\s+/, '').trim());
    });

    // Also extract numbered points
    const numberedPoints = content.match(/^\d+\.\s+.+$/gm) || [];
    numberedPoints.forEach(point => {
      points.push(point.trim());
    });

    return points;
  }

  extractDefinitions(content) {
    const definitions = [];
    const defPatterns = [
      /(\w+)\s+is\s+(?:a|an|the)\s+([^.]+)\./g,
      /(\w+)\s+means\s+([^.]+)\./g,
      /(\w+)\s+refers to\s+([^.]+)\./g
    ];

    defPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        definitions.push({
          term: match[1],
          definition: match[2]
        });
      }
    });

    return definitions;
  }

  extractFormulas(content) {
    const formulas = [];
    const formulaPattern = /=\s*[^=\n]+/g;
    const matches = content.match(formulaPattern) || [];
    
    matches.forEach(formula => {
      formulas.push(formula.trim());
    });

    return formulas;
  }

  extractExamples(content) {
    const examples = [];
    const examplePattern = /ILLUSTRATION\s+\d+[\s\S]+?(?=ILLUSTRATION|SOLUTION|$)/gi;
    const matches = content.match(examplePattern) || [];
    
    matches.forEach(example => {
      examples.push(example.trim());
    });

    return examples;
  }

  /**
   * Generate audio narration
   */
  async generateAudio(notes, outputPath) {
    try {
      const audioSegments = [];
      
      for (const section of notes.sections) {
        const scriptText = this.createAudioScript(section);
        
        const [response] = await this.ttsClient.synthesizeSpeech({
          input: { text: scriptText },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-J', // Professional male voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0,
            volumeGainDb: 0
          }
        });

        const segmentPath = path.join(
          path.dirname(outputPath),
          `segment_${audioSegments.length}.mp3`
        );
        
        await fs.writeFile(segmentPath, response.audioContent, 'binary');
        audioSegments.push(segmentPath);
      }

      // Combine all audio segments
      await this.combineAudioSegments(audioSegments, outputPath);
      
      // Clean up temporary segments
      for (const segment of audioSegments) {
        await fs.unlink(segment);
      }

      return outputPath;
    } catch (error) {
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  createAudioScript(section) {
    let script = `${section.title}. `;
    
    if (section.summary) {
      script += `${section.summary} `;
    }

    if (section.keyPoints && section.keyPoints.length > 0) {
      script += 'Key points are: ';
      section.keyPoints.forEach((point, index) => {
        script += `${index + 1}. ${point}. `;
      });
    }

    if (section.definitions && section.definitions.length > 0) {
      script += 'Important definitions: ';
      section.definitions.forEach(def => {
        script += `${def.term} is ${def.definition}. `;
      });
    }

    return script;
  }

  async combineAudioSegments(segments, outputPath) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      segments.forEach(segment => {
        command.input(segment);
      });

      command
        .on('error', reject)
        .on('end', resolve)
        .mergeToFile(outputPath);
    });
  }

  /**
   * Generate video with slides and narration
   */
  async generateVideo(notes, audioPath, outputPath) {
    try {
      const slideImages = await this.generateSlides(notes);
      const audioDuration = await this.getAudioDuration(audioPath);
      const slideDuration = audioDuration / slideImages.length;

      return new Promise((resolve, reject) => {
        const command = ffmpeg();

        // Add all slide images
        slideImages.forEach(slide => {
          command.input(slide).inputOptions([
            '-loop 1',
            `-t ${slideDuration}`
          ]);
        });

        // Add audio
        command.input(audioPath);

        command
          .complexFilter([
            `concat=n=${slideImages.length}:v=1:a=0[v]`,
            '[v][0:a]concat=n=1:v=1:a=1[out]'
          ])
          .outputOptions([
            '-map [out]',
            '-c:v libx264',
            '-c:a aac',
            '-shortest',
            '-pix_fmt yuv420p'
          ])
          .output(outputPath)
          .on('error', reject)
          .on('end', async () => {
            // Clean up temporary slide images
            for (const slide of slideImages) {
              await fs.unlink(slide);
            }
            resolve(outputPath);
          })
          .run();
      });
    } catch (error) {
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }

  /**
   * Generate slide images for each section
   */
  async generateSlides(notes) {
    const slideImages = [];
    const slideDir = path.join(__dirname, '../temp/slides');
    
    await fs.mkdir(slideDir, { recursive: true });

    for (let i = 0; i < notes.sections.length; i++) {
      const section = notes.sections[i];
      const slidePath = path.join(slideDir, `slide_${i}.png`);
      
      await this.createSlideImage(section, slidePath, i + 1);
      slideImages.push(slidePath);
    }

    return slideImages;
  }

  async createSlideImage(section, outputPath, slideNumber) {
    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    const titleY = 150;
    this.wrapText(ctx, section.title, width / 2, titleY, width - 200, 70);

    // Divider line
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, titleY + 100);
    ctx.lineTo(width - 300, titleY + 100);
    ctx.stroke();

    // Content
    ctx.font = '36px Arial';
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'left';
    let contentY = titleY + 180;

    // Key points
    if (section.keyPoints && section.keyPoints.length > 0) {
      section.keyPoints.slice(0, 5).forEach((point, index) => {
        const bulletPoint = `• ${point}`;
        const lines = this.wrapText(ctx, bulletPoint, 150, contentY, width - 300, 45);
        contentY += lines * 45 + 20;
      });
    }

    // Slide number
    ctx.font = '28px Arial';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'right';
    ctx.fillText(`${slideNumber}`, width - 50, height - 50);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    lineCount++;
    
    return lineCount;
  }

  async getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });
  }

  /**
   * Main method to process PDF and generate all content
   */
  async processDocument(pdfPath, outputDir) {
    try {
      console.log('Extracting PDF content...');
      const pdfContent = await this.extractPDFContent(pdfPath);
      
      console.log('Parsing content structure...');
      const sections = this.parseContent(pdfContent.text);
      
      console.log('Generating structured notes...');
      const notes = await this.generateNotes(sections);
      
      // Save notes as JSON
      const notesPath = path.join(outputDir, 'notes.json');
      await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));
      
      console.log('Generating audio narration...');
      const audioPath = path.join(outputDir, 'narration.mp3');
      await this.generateAudio(notes, audioPath);
      
      console.log('Generating video with slides...');
      const videoPath = path.join(outputDir, 'lesson_video.mp4');
      await this.generateVideo(notes, audioPath, videoPath);
      
      console.log('Content generation complete!');
      
      return {
        notes: notesPath,
        audio: audioPath,
        video: videoPath,
        metadata: {
          title: notes.title,
          sections: notes.sections.length,
          generatedAt: notes.generatedAt
        }
      };
    } catch (error) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }
}

module.exports = PDFContentGenerator;
