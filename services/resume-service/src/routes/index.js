const express = require('express');
const router = express.Router();
const auth = require('../../../packages/shared/src/middleware/auth');
const resumeController = require('../controllers/resume.controller');

// ========== RESUME ROUTES ==========

// Create resume
router.post('/resumes', auth, (req, res, next) => 
  resumeController.create(req, res, next)
);

// Get all resumes for user
router.get('/resumes', auth, (req, res, next) => 
  resumeController.getAll(req, res, next)
);

// Get user statistics
router.get('/resumes/statistics', auth, (req, res, next) => 
  resumeController.getStatistics(req, res, next)
);

// Search resumes
router.get('/resumes/search', auth, (req, res, next) => 
  resumeController.search(req, res, next)
);

// Get single resume
router.get('/resumes/:resumeId', auth, (req, res, next) => 
  resumeController.getById(req, res, next)
);

// Update resume
router.put('/resumes/:resumeId', auth, (req, res, next) => 
  resumeController.update(req, res, next)
);

// Delete resume
router.delete('/resumes/:resumeId', auth, (req, res, next) => 
  resumeController.delete(req, res, next)
);

// Duplicate resume
router.post('/resumes/:resumeId/duplicate', auth, (req, res, next) => 
  resumeController.duplicate(req, res, next)
);

// Update resume status
router.patch('/resumes/:resumeId/status', auth, (req, res, next) => 
  resumeController.updateStatus(req, res, next)
);

// Make resume public
router.post('/resumes/:resumeId/public', auth, (req, res, next) => 
  resumeController.makePublic(req, res, next)
);

// Export resume as PDF
router.get('/resumes/:resumeId/export/pdf', auth, (req, res, next) => 
  resumeController.exportPDF(req, res, next)
);

// Export resume as DOCX
router.get('/resumes/:resumeId/export/docx', auth, (req, res, next) => 
  resumeController.exportDOCX(req, res, next)
);

// ========== TEMPLATE ROUTES ==========

// Get all templates
router.get('/templates', auth, (req, res, next) => 
  resumeController.getTemplates(req, res, next)
);

// Get template by name
router.get('/templates/:templateName', auth, (req, res, next) => 
  resumeController.getTemplate(req, res, next)
);

// ========== PUBLIC ROUTES (NO AUTH) ==========

// Get public resume
router.get('/public/:publicUrl', (req, res, next) => 
  resumeController.getPublic(req, res, next)
);

// ========== HEALTH CHECK ==========
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'resume-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
