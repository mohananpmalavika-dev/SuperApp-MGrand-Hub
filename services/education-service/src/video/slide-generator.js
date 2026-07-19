const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Slide Generator - Creates professional presentation slides from lesson content
 */
class SlideGenerator {
  constructor() {
    this.slideWidth = 1920;
    this.slideHeight = 1080;
    this.outputDir = path.join(__dirname, '../../uploads/slides');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create slides directory:', error);
    }
  }

  /**
   * Generate slides from lesson content
   */
  async generateSlides(lessonContent) {
    const slides = [];
    const slideId = uuidv4();

    try {
      // Slide 1: Title
      const titleSlide = await this.createTitleSlide(
        lessonContent.topic,
        lessonContent.subject
      );
      slides.push(titleSlide);

      // Slide 2: Learning Objectives
      if (lessonContent.keyConcepts && lessonContent.keyConcepts.length > 0) {
        const objectivesSlide = await this.createObjectivesSlide(
          lessonContent.keyConcepts
        );
        slides.push(objectivesSlide);
      }

      // Slide 3-N: Key Concepts (one per slide)
      for (const concept of lessonContent.keyConcepts || []) {
        const conceptSlide = await this.createConceptSlide(concept);
        slides.push(conceptSlide);
      }

      // Solved Examples
      for (const example of lessonContent.solvedExamples || []) {
        const exampleSlide = await this.createExampleSlide(example);
        slides.push(exampleSlide);
      }

      // Quick Revision
      if (lessonContent.quickRevision) {
        const revisionSlide = await this.createRevisionSlide(
          lessonContent.quickRevision
        );
        slides.push(revisionSlide);
      }

      // Summary Slide
      const summarySlide = await this.createSummarySlide(
        lessonContent.examTips || []
      );
      slides.push(summarySlide);

      logger.info('Generated slides successfully', { count: slides.length });
      return slides;
    } catch (error) {
      logger.error('Failed to generate slides:', error);
      throw error;
    }
  }

  /**
   * Create title slide
   */
  async createTitleSlide(topic, subject) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.slideHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(topic, this.slideWidth / 2, this.slideHeight / 2 - 50);

    // Subtitle
    ctx.font = '48px Arial';
    ctx.fillText(subject, this.slideWidth / 2, this.slideHeight / 2 + 50);

    // Footer
    ctx.font = '32px Arial';
    ctx.fillText('AI-Powered Learning Platform', this.slideWidth / 2, this.slideHeight - 100);

    return await this.saveSlide(canvas, 'title');
  }

  /**
   * Create objectives slide
   */
  async createObjectivesSlide(concepts) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Header
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, this.slideWidth, 150);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Learning Objectives', this.slideWidth / 2, 100);

    // Objectives
    ctx.fillStyle = '#333333';
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    
    const startY = 250;
    const lineHeight = 80;
    
    concepts.slice(0, 6).forEach((concept, index) => {
      // Bullet point
      ctx.fillStyle = '#667eea';
      ctx.beginPath();
      ctx.arc(200, startY + index * lineHeight, 15, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#333333';
      const text = this.wrapText(concept.concept, 1400);
      ctx.fillText(text, 250, startY + index * lineHeight + 10);
    });

    return await this.saveSlide(canvas, 'objectives');
  }

  /**
   * Create concept explanation slide
   */
  async createConceptSlide(concept) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Header
    ctx.fillStyle = '#764ba2';
    ctx.fillRect(0, 0, this.slideWidth, 150);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(concept.concept, this.slideWidth / 2, 100);

    // Definition box
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(100, 200, this.slideWidth - 200, 250);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 200, this.slideWidth - 200, 250);

    ctx.fillStyle = '#333333';
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    
    // Definition
    const definitionLines = this.splitTextIntoLines(
      concept.definition || concept.explanation,
      1600,
      ctx,
      '36px Arial'
    );
    
    definitionLines.forEach((line, index) => {
      ctx.fillText(line, 150, 280 + index * 50);
    });

    // Explanation
    if (concept.explanation) {
      ctx.font = 'bold 40px Arial';
      ctx.fillText('Explanation:', 100, 550);
      
      ctx.font = '34px Arial';
      const explanationLines = this.splitTextIntoLines(
        concept.explanation,
        1700,
        ctx,
        '34px Arial'
      );
      
      explanationLines.forEach((line, index) => {
        ctx.fillText(line, 100, 620 + index * 50);
      });
    }

    return await this.saveSlide(canvas, 'concept');
  }

  /**
   * Create example slide
   */
  async createExampleSlide(example) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Header
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(0, 0, this.slideWidth, 150);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📝 Solved Example', this.slideWidth / 2, 100);

    // Question box
    ctx.fillStyle = '#FFF9E6';
    ctx.fillRect(100, 200, this.slideWidth - 200, 200);
    ctx.strokeStyle = '#FFB84D';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 200, this.slideWidth - 200, 200);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Question:', 120, 250);

    ctx.font = '32px Arial';
    const questionLines = this.splitTextIntoLines(
      example.question,
      1600,
      ctx,
      '32px Arial'
    );
    questionLines.forEach((line, index) => {
      ctx.fillText(line, 120, 300 + index * 45);
    });

    // Solution
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Solution:', 100, 480);

    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(100, 520, this.slideWidth - 200, 450);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 520, this.slideWidth - 200, 450);

    ctx.fillStyle = '#333333';
    ctx.font = '30px Courier';
    const solutionLines = this.splitTextIntoLines(
      example.solution,
      1600,
      ctx,
      '30px Courier'
    );
    
    solutionLines.slice(0, 12).forEach((line, index) => {
      ctx.fillText(line, 120, 570 + index * 40);
    });

    return await this.saveSlide(canvas, 'example');
  }

  /**
   * Create revision slide
   */
  async createRevisionSlide(revision) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Header
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(0, 0, this.slideWidth, 150);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Quick Revision', this.slideWidth / 2, 100);

    // Summary points
    ctx.fillStyle = '#333333';
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    
    let currentY = 220;
    
    // Key Points
    if (revision.summary && revision.summary.length > 0) {
      ctx.font = 'bold 40px Arial';
      ctx.fillText('Key Points:', 100, currentY);
      currentY += 60;
      
      ctx.font = '34px Arial';
      revision.summary.slice(0, 5).forEach((point) => {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('✓', 120, currentY);
        ctx.fillStyle = '#333333';
        ctx.fillText(this.wrapText(point, 1500), 180, currentY);
        currentY += 70;
      });
    }

    // Formulas
    if (revision.formulas && revision.formulas.length > 0) {
      currentY += 40;
      ctx.font = 'bold 40px Arial';
      ctx.fillText('Important Formulas:', 100, currentY);
      currentY += 60;
      
      ctx.fillStyle = '#E3F2FD';
      ctx.fillRect(100, currentY, this.slideWidth - 200, 200);
      
      ctx.fillStyle = '#1976D2';
      ctx.font = '32px Courier';
      revision.formulas.slice(0, 4).forEach((formula) => {
        ctx.fillText(formula, 120, currentY + 40);
        currentY += 50;
      });
    }

    return await this.saveSlide(canvas, 'revision');
  }

  /**
   * Create summary slide
   */
  async createSummarySlide(examTips) {
    const canvas = createCanvas(this.slideWidth, this.slideHeight);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.slideHeight);
    gradient.addColorStop(0, '#11998e');
    gradient.addColorStop(1, '#38ef7d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.slideWidth, this.slideHeight);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 Exam Tips', this.slideWidth / 2, 200);

    // Tips
    ctx.font = '38px Arial';
    ctx.textAlign = 'left';
    
    const startY = 350;
    examTips.slice(0, 6).forEach((tip, index) => {
      // Number circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(200, startY + index * 100, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#11998e';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), 200, startY + index * 100 + 10);
      
      // Tip text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      const tipText = this.wrapText(tip, 1400);
      ctx.fillText(tipText, 270, startY + index * 100 + 10);
    });

    // Footer
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('All the Best! 🌟', this.slideWidth / 2, this.slideHeight - 80);

    return await this.saveSlide(canvas, 'summary');
  }

  /**
   * Helper: Wrap text to fit width
   */
  wrapText(text, maxWidth) {
    if (text.length < 80) return text;
    return text.substring(0, 77) + '...';
  }

  /**
   * Helper: Split text into multiple lines
   */
  splitTextIntoLines(text, maxWidth, ctx, font) {
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

  /**
   * Save slide as PNG
   */
  async saveSlide(canvas, type) {
    const slideId = uuidv4();
    const filename = `slide-${type}-${slideId}.png`;
    const filepath = path.join(this.outputDir, filename);

    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filepath, buffer);

    logger.info('Slide saved', { filename, type });

    return {
      filename,
      filepath,
      url: `/api/education/slides/${filename}`,
      type,
    };
  }

  /**
   * Get slide duration based on content
   */
  getSlideDuration(slideType) {
    const durations = {
      title: 3,
      objectives: 10,
      concept: 15,
      example: 20,
      revision: 15,
      summary: 10,
    };
    return durations[slideType] || 10;
  }
}

module.exports = new SlideGenerator();
