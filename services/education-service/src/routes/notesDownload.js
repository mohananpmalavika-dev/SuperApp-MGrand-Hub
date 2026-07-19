const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const driveContentService = require('../services/driveContentService');
const logger = require('../utils/logger');

/**
 * Routes for downloading notes in different formats
 * 
 * Generates PDF, DOCX, or TXT from lesson data
 */

/**
 * Generate simple text format notes
 */
function generateTextNotes(lesson) {
  const lines = [];
  
  // Title
  lines.push(lesson.topic || lesson.title || 'Lesson Notes');
  lines.push('='.repeat((lesson.topic || lesson.title || 'Lesson Notes').length));
  lines.push('');
  
  // Subject and Duration
  if (lesson.subject) lines.push(`Subject: ${lesson.subject}`);
  if (lesson.duration) lines.push(`Duration: ${lesson.duration} minutes`);
  if (lesson.examType) lines.push(`Exam: ${lesson.examType}`);
  lines.push('');
  lines.push('-'.repeat(70));
  lines.push('');
  
  // Introduction
  if (lesson.introduction) {
    lines.push('INTRODUCTION');
    lines.push('-'.repeat(70));
    lines.push(lesson.introduction);
    lines.push('');
  }
  
  // Key Concepts
  if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
    lines.push('KEY CONCEPTS');
    lines.push('-'.repeat(70));
    lesson.keyConcepts.forEach((concept, i) => {
      lines.push(`${i + 1}. ${concept.concept || 'Concept'}`);
      if (concept.definition) lines.push(`   Definition: ${concept.definition}`);
      if (concept.explanation) lines.push(`   Explanation: ${concept.explanation}`);
      lines.push('');
    });
  }
  
  // Detailed Content
  if (lesson.detailedContent) {
    lines.push('DETAILED EXPLANATION');
    lines.push('-'.repeat(70));
    lines.push(lesson.detailedContent);
    lines.push('');
  }
  
  // Examples
  const examples = lesson.solvedExamples || lesson.practicalExamples || [];
  if (examples.length > 0) {
    lines.push('SOLVED EXAMPLES');
    lines.push('-'.repeat(70));
    examples.forEach((example, i) => {
      lines.push(`Example ${i + 1}: ${example.question || example.title || ''}`);
      if (example.solution) lines.push(`Solution: ${example.solution}`);
      if (example.keyTakeaway) lines.push(`Key Takeaway: ${example.keyTakeaway}`);
      lines.push('');
    });
  }
  
  // Practice Questions
  const questions = lesson.practiceProblems || lesson.practiceQuestions || [];
  if (questions.length > 0) {
    lines.push('PRACTICE QUESTIONS');
    lines.push('-'.repeat(70));
    questions.forEach((q, i) => {
      lines.push(`Q${i + 1}. ${q.question}`);
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt, j) => {
          lines.push(`   ${String.fromCharCode(65 + j)}. ${opt}`);
        });
      }
      if (q.correctAnswer !== undefined) {
        lines.push(`   Answer: ${String.fromCharCode(65 + q.correctAnswer)}`);
      }
      if (q.explanation) {
        lines.push(`   Explanation: ${q.explanation}`);
      }
      lines.push('');
    });
  }
  
  // Quick Revision
  if (lesson.quickRevision) {
    lines.push('QUICK REVISION');
    lines.push('-'.repeat(70));
    if (lesson.quickRevision.summary && Array.isArray(lesson.quickRevision.summary)) {
      lesson.quickRevision.summary.forEach(point => {
        lines.push(`• ${point}`);
      });
    }
    if (lesson.quickRevision.formulas && Array.isArray(lesson.quickRevision.formulas)) {
      lines.push('');
      lines.push('Key Formulas:');
      lesson.quickRevision.formulas.forEach(formula => {
        lines.push(`  - ${formula}`);
      });
    }
    lines.push('');
  }
  
  // Exam Tips
  if (lesson.examTips && Array.isArray(lesson.examTips) && lesson.examTips.length > 0) {
    lines.push('EXAM TIPS');
    lines.push('-'.repeat(70));
    lesson.examTips.forEach((tip, i) => {
      lines.push(`${i + 1}. ${tip}`);
    });
    lines.push('');
  }
  
  // Summary
  if (lesson.summary) {
    lines.push('SUMMARY');
    lines.push('-'.repeat(70));
    lines.push(lesson.summary);
    lines.push('');
  }
  
  // Footer
  lines.push('-'.repeat(70));
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  if (lesson.examType) lines.push(`Exam: ${lesson.examType}`);
  lines.push('Personal AI Tutor - Learn Smarter, Not Harder');
  
  return lines.join('\n');
}

/**
 * GET /api/education/notes/download/:fileId/:lessonIndex
 * Download lesson notes as TXT
 */
router.get('/download/:fileId/:lessonIndex', optionalAuth, async (req, res) => {
  try {
    const { fileId, lessonIndex } = req.params;
    const { format = 'txt' } = req.query; // txt, pdf, docx
    
    const index = parseInt(lessonIndex, 10);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson index'
      });
    }

    logger.info('Generating notes download', { 
      fileId, 
      lessonIndex: index, 
      format,
      userId: req.user?.userId 
    });

    // Fetch lesson from Google Drive
    const lesson = await driveContentService.fetchLesson(fileId, index);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Generate notes based on format
    if (format === 'txt') {
      const textNotes = generateTextNotes(lesson);
      
      const filename = `${(lesson.topic || lesson.title || 'lesson').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-notes.txt`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(textNotes);
      
    } else if (format === 'pdf') {
      // TODO: Implement PDF generation using PDFKit
      return res.status(501).json({
        success: false,
        message: 'PDF generation not yet implemented. Use TXT format for now.'
      });
      
    } else if (format === 'docx') {
      // TODO: Implement DOCX generation using docx library
      return res.status(501).json({
        success: false,
        message: 'DOCX generation not yet implemented. Use TXT format for now.'
      });
      
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Use: txt, pdf, or docx'
      });
    }

  } catch (error) {
    logger.error('Error generating notes download', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate notes',
      error: error.message
    });
  }
});

/**
 * GET /api/education/notes/preview/:fileId/:lessonIndex
 * Get notes data for online viewing (JSON)
 */
router.get('/preview/:fileId/:lessonIndex', optionalAuth, async (req, res) => {
  try {
    const { fileId, lessonIndex } = req.params;
    const index = parseInt(lessonIndex, 10);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson index'
      });
    }

    // Fetch lesson from Google Drive
    const lesson = await driveContentService.fetchLesson(fileId, index);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Return structured notes data for online viewing
    res.json({
      success: true,
      data: {
        title: lesson.topic || lesson.title,
        subject: lesson.subject,
        duration: lesson.duration,
        examType: lesson.examType,
        sections: {
          introduction: lesson.introduction,
          keyConcepts: lesson.keyConcepts,
          detailedContent: lesson.detailedContent,
          examples: lesson.solvedExamples || lesson.practicalExamples || [],
          practiceQuestions: lesson.practiceProblems || lesson.practiceQuestions || [],
          quickRevision: lesson.quickRevision,
          examTips: lesson.examTips,
          summary: lesson.summary
        },
        downloadFormats: ['TXT', 'PDF (coming soon)', 'DOCX (coming soon)']
      }
    });

  } catch (error) {
    logger.error('Error fetching notes preview', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
});

module.exports = router;
