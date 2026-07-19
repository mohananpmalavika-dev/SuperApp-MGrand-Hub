const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const execPromise = promisify(exec);

/**
 * Manim Animation Generator - Creates animated whiteboard videos for math/accounting
 */
class ManimGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/animations');
    this.scriptsDir = path.join(__dirname, '../../uploads/manim-scripts');
    this.ensureOutputDirs();
  }

  async ensureOutputDirs() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.scriptsDir, { recursive: true});
    } catch (error) {
      logger.error('Failed to create animation directories:', error);
    }
  }

  /**
   * Generate animated video for accounting problems
   */
  async generateAccountingAnimation(example) {
    const animId = uuidv4();
    
    try {
      logger.info('Generating accounting animation', { example: example.question });

      // Generate Python script for Manim
      const pythonScript = this.generateAccountingScript(example, animId);
      
      // Save script
      const scriptPath = path.join(this.scriptsDir, `${animId}.py`);
      await fs.writeFile(scriptPath, pythonScript);

      // Run Manim to generate video
      const outputPath = await this.runManim(scriptPath, animId);

      logger.info('Animation generated successfully', { outputPath });

      return {
        animId,
        videoUrl: `/api/education/animations/${path.basename(outputPath)}`,
        scriptPath,
      };
    } catch (error) {
      logger.error('Animation generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate Python script for accounting animation
   */
  generateAccountingScript(example, animId) {
    // Extract journal entries from solution
    const entries = this.parseJournalEntries(example.solution);

    return `
from manim import *

class Accounting_${animId.replace(/-/g, '_')} (Scene):
    def construct(self):
        # Title
        title = Text("${this.escapeText(example.question)}", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)

        # Problem statement
        problem = Text(
            "${this.escapeText(example.question)}",
            font_size=28,
            color=YELLOW
        ).scale(0.8)
        problem.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(problem))
        self.wait(2)

        # Clear problem
        self.play(FadeOut(problem))

        # Solution heading
        solution_heading = Text("Solution:", font_size=32, color=GREEN)
        solution_heading.to_edge(UP).shift(DOWN * 1.5)
        self.play(Write(solution_heading))
        self.wait(0.5)

        # Journal Entry Table
        ${this.generateJournalEntryAnimation(entries)}

        # Total line
        total = Line(LEFT * 3, RIGHT * 3, color=WHITE)
        total.next_to(last_entry, DOWN, buff=0.3)
        self.play(Create(total))
        self.wait(1)

        # Key takeaway
        takeaway = Text(
            "${this.escapeText(example.keyTakeaway || 'Remember: Every debit must have an equal credit')}",
            font_size=24,
            color=BLUE
        ).scale(0.9)
        takeaway.to_edge(DOWN)
        self.play(FadeIn(takeaway))
        self.wait(3)

        # Fade out
        self.play(FadeOut(VGroup(*self.mobjects)))
        
        # Success message
        success = Text("✓ Concept Clear!", font_size=48, color=GREEN)
        self.play(Write(success))
        self.wait(2)
`;
  }

  /**
   * Generate animation code for journal entries
   */
  generateJournalEntryAnimation(entries) {
    let code = `
        # Create table header
        header = VGroup(
            Text("Particulars", font_size=24),
            Text("Dr.", font_size=24),
            Text("Cr.", font_size=24)
        ).arrange(RIGHT, buff=1.5)
        header.shift(UP * 2)
        self.play(Write(header))
        self.wait(0.5)
        
        # Underline
        underline = Line(LEFT * 4, RIGHT * 4, color=YELLOW)
        underline.next_to(header, DOWN, buff=0.1)
        self.play(Create(underline))
        self.wait(0.3)
`;

    entries.forEach((entry, index) => {
      code += `
        # Entry ${index + 1}
        entry_${index} = VGroup(
            Text("${this.escapeText(entry.particular)}", font_size=22),
            Text("${entry.debit || ''}", font_size=22, color=RED),
            Text("${entry.credit || ''}", font_size=22, color=GREEN)
        ).arrange(RIGHT, buff=1.5)
        entry_${index}.next_to(${index === 0 ? 'underline' : `entry_${index - 1}`}, DOWN, buff=0.4)
        self.play(Write(entry_${index}), run_time=1.5)
        self.wait(0.5)
`;
    });

    code += `\n        last_entry = entry_${entries.length - 1}`;
    return code;
  }

  /**
   * Generate animation for mathematical problems
   */
  async generateMathAnimation(problem) {
    const animId = uuidv4();

    const pythonScript = `
from manim import *

class Math_${animId.replace(/-/g, '_')}(Scene):
    def construct(self):
        # Title
        title = Text("${this.escapeText(problem.question)}", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)

        # Formula
        formula = MathTex(
            r"${this.extractFormula(problem.solution)}"
        ).scale(1.5)
        formula.shift(UP * 1)
        self.play(Write(formula))
        self.wait(2)

        # Step-by-step solution
        ${this.generateStepByStepAnimation(problem.solution)}

        # Final answer
        answer = Text(
            "Answer: ${this.extractAnswer(problem.solution)}",
            font_size=40,
            color=GREEN
        )
        answer.to_edge(DOWN)
        self.play(Write(answer))
        self.wait(2)
`;

    const scriptPath = path.join(this.scriptsDir, `${animId}.py`);
    await fs.writeFile(scriptPath, pythonScript);

    const outputPath = await this.runManim(scriptPath, animId);

    return {
      animId,
      videoUrl: `/api/education/animations/${path.basename(outputPath)}`,
    };
  }

  /**
   * Run Manim to generate video
   */
  async runManim(scriptPath, animId) {
    try {
      // Run manim command
      const command = `manim -pql "${scriptPath}" -o "${animId}.mp4"`;
      
      logger.info('Running Manim', { command });
      
      const { stdout, stderr } = await execPromise(command, {
        cwd: this.scriptsDir,
        timeout: 180000, // 3 minutes
      });

      logger.debug('Manim output', { stdout, stderr });

      // Find generated video
      const videoPath = path.join(
        this.scriptsDir,
        'media',
        'videos',
        path.basename(scriptPath, '.py'),
        '480p15',
        `${animId}.mp4`
      );

      // Move to uploads directory
      const finalPath = path.join(this.outputDir, `${animId}.mp4`);
      await fs.rename(videoPath, finalPath);

      return finalPath;
    } catch (error) {
      logger.error('Manim execution failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Parse journal entries from text
   */
  parseJournalEntries(solutionText) {
    const entries = [];
    const lines = solutionText.split('\n');

    for (const line of lines) {
      // Look for journal entry pattern
      if (line.includes('Dr.') || line.includes('To ')) {
        const match = line.match(/(.+?)\s+(Dr\.?)?\s+(\d+,?\d*)/);
        if (match) {
          const particular = match[1].trim();
          const amount = match[3].replace(/,/g, '');
          
          if (line.includes('To ')) {
            entries.push({ particular, credit: amount });
          } else {
            entries.push({ particular, debit: amount });
          }
        }
      }
    }

    return entries.length > 0 ? entries : [
      { particular: 'Account A/c', debit: '10,000' },
      { particular: 'To Account B/c', credit: '10,000' }
    ];
  }

  /**
   * Helper: Extract formula from solution
   */
  extractFormula(solution) {
    // Simple formula extraction
    const formulaMatch = solution.match(/Formula:?\s*([^\n]+)/i);
    return formulaMatch ? formulaMatch[1] : 'a + b = c';
  }

  /**
   * Helper: Extract answer from solution
   */
  extractAnswer(solution) {
    const answerMatch = solution.match(/Answer:?\s*([^\n]+)/i);
    return answerMatch ? answerMatch[1] : 'See solution above';
  }

  /**
   * Helper: Generate step-by-step animation
   */
  generateStepByStepAnimation(solution) {
    const steps = solution.split('\n').filter(line => 
      line.trim().startsWith('Step') || line.match(/^\d+\./)
    );

    return steps.slice(0, 5).map((step, index) => `
        step_${index} = Text(
            "${this.escapeText(step)}",
            font_size=28
        ).scale(0.8)
        step_${index}.shift(DOWN * ${index * 0.8})
        self.play(FadeIn(step_${index}))
        self.wait(1)
    `).join('\n');
  }

  /**
   * Helper: Escape text for Python string
   */
  escapeText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .substring(0, 100); // Limit length
  }

  /**
   * Check if Manim is installed
   */
  async checkManimInstallation() {
    try {
      await execPromise('manim --version');
      return true;
    } catch (error) {
      logger.error('Manim not installed');
      return false;
    }
  }
}

module.exports = new ManimGenerator();
