const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFContentGenerator = require('../services/PDFContentGenerator');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const generator = new PDFContentGenerator();

// In-memory job tracking (in production, use Redis or database)
const jobs = new Map();

/**
 * POST /api/content-generation/upload
 * Upload PDF and start async processing
 */
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputDir = path.join(__dirname, '../../outputs', jobId);

    await fs.mkdir(outputDir, { recursive: true });

    // Store job info
    const jobInfo = {
      id: jobId,
      status: 'processing',
      startedAt: new Date().toISOString(),
      userId: req.user.id,
      filename: req.file.originalname,
      progress: 0,
    };

    jobs.set(jobId, jobInfo);

    // Start processing in background
    processInBackground(pdfPath, outputDir, jobId);

    res.json({
      success: true,
      message: 'Content generation started',
      jobId: jobId,
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to start content generation',
      details: error.message,
    });
  }
});

/**
 * Background processing function
 */
async function processInBackground(pdfPath, outputDir, jobId) {
  const jobInfo = jobs.get(jobId);

  try {
    jobInfo.progress = 10;
    jobInfo.currentStep = 'Extracting text from PDF';

    const result = await generator.processDocument(pdfPath, outputDir);

    jobInfo.status = 'completed';
    jobInfo.completedAt = new Date().toISOString();
    jobInfo.result = result;
    jobInfo.progress = 100;

    // Clean up uploaded PDF
    await fs.unlink(pdfPath).catch(() => {});

    logger.info(`Job ${jobId} completed successfully`);
  } catch (error) {
    jobInfo.status = 'failed';
    jobInfo.error = error.message;
    jobInfo.failedAt = new Date().toISOString();

    logger.error(`Job ${jobId} failed: ${error.message}`);
  }
}

/**
 * GET /api/content-generation/status/:jobId
 * Check job status
 */
router.get('/status/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobInfo = jobs.get(jobId);

    if (!jobInfo) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user owns this job
    if (jobInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      status: jobInfo,
    });
  } catch (error) {
    logger.error(`Status check error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to check status',
      details: error.message,
    });
  }
});

/**
 * GET /api/content-generation/download/:jobId/:type
 * Download generated content
 */
router.get('/download/:jobId/:type', authenticateToken, async (req, res) => {
  try {
    const { jobId, type } = req.params;
    const jobInfo = jobs.get(jobId);

    if (!jobInfo) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user owns this job
    if (jobInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (jobInfo.status !== 'completed') {
      return res.status(400).json({ error: 'Content generation not completed' });
    }

    const outputDir = path.join(__dirname, '../../outputs', jobId);

    // Determine file path based on type
    let filePath, contentType, filename;

    switch (type) {
      case 'notes':
        filePath = path.join(outputDir, 'notes.json');
        contentType = 'application/json';
        filename = `${jobInfo.filename.replace('.pdf', '')}_notes.json`;
        break;
      case 'audio':
        filePath = path.join(outputDir, 'narration.mp3');
        contentType = 'audio/mpeg';
        filename = `${jobInfo.filename.replace('.pdf', '')}_audio.mp3`;
        break;
      case 'video':
        filePath = path.join(outputDir, 'lesson_video.mp4');
        contentType = 'video/mp4';
        filename = `${jobInfo.filename.replace('.pdf', '')}_video.mp4`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid content type' });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    logger.error(`Download error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to download content',
      details: error.message,
    });
  }
});

/**
 * GET /api/content-generation/preview/:jobId/notes
 * Preview notes
 */
router.get('/preview/:jobId/notes', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobInfo = jobs.get(jobId);

    if (!jobInfo) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user owns this job
    if (jobInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const notesPath = path.join(__dirname, '../../outputs', jobId, 'notes.json');

    const notesData = await fs.readFile(notesPath, 'utf-8');
    const notes = JSON.parse(notesData);

    res.json({
      success: true,
      notes: notes,
    });
  } catch (error) {
    logger.error(`Preview error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to load notes',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/content-generation/:jobId
 * Delete generated content
 */
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobInfo = jobs.get(jobId);

    if (!jobInfo) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user owns this job
    if (jobInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete output directory
    const outputDir = path.join(__dirname, '../../outputs', jobId);
    await fs.rm(outputDir, { recursive: true, force: true });

    // Remove from jobs map
    jobs.delete(jobId);

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to delete content',
      details: error.message,
    });
  }
});

/**
 * GET /api/content-generation/jobs
 * List all jobs for current user
 */
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const userJobs = Array.from(jobs.values()).filter((job) => job.userId === req.user.id);

    res.json({
      success: true,
      jobs: userJobs,
    });
  } catch (error) {
    logger.error(`Jobs list error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      details: error.message,
    });
  }
});

module.exports = router;
