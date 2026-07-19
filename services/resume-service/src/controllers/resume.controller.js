const resumeService = require('../services/resume.service');
const exportService = require('../services/export.service');
const logger = require('../../../packages/shared/src/logger');
const { apiResponse } = require('../../../packages/shared/src/utils/apiResponse');

/**
 * Resume Controller
 * Handles HTTP requests for resume operations
 */
class ResumeController {
  /**
   * Create a new resume
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const resumeData = req.body;

      const resume = await resumeService.createResume(userId, resumeData);

      res.status(201).json(apiResponse.success(resume, 'Resume created successfully'));
    } catch (error) {
      logger.error('Error in create resume:', error);
      next(error);
    }
  }

  /**
   * Get resume by ID
   */
  async getById(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;

      const resume = await resumeService.getResumeById(resumeId, userId);

      res.json(apiResponse.success(resume, 'Resume retrieved successfully'));
    } catch (error) {
      logger.error('Error in get resume:', error);
      next(error);
    }
  }

  /**
   * Get all resumes for the authenticated user
   */
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        search: req.query.search,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
      };

      const result = await resumeService.getUserResumes(userId, filters);

      res.json(apiResponse.success(result, 'Resumes retrieved successfully'));
    } catch (error) {
      logger.error('Error in get all resumes:', error);
      next(error);
    }
  }

  /**
   * Update resume
   */
  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;
      const updates = req.body;

      const resume = await resumeService.updateResume(resumeId, userId, updates);

      res.json(apiResponse.success(resume, 'Resume updated successfully'));
    } catch (error) {
      logger.error('Error in update resume:', error);
      next(error);
    }
  }

  /**
   * Delete resume
   */
  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;

      await resumeService.deleteResume(resumeId, userId);

      res.json(apiResponse.success(null, 'Resume deleted successfully'));
    } catch (error) {
      logger.error('Error in delete resume:', error);
      next(error);
    }
  }

  /**
   * Duplicate resume
   */
  async duplicate(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;

      const duplicate = await resumeService.duplicateResume(resumeId, userId);

      res.status(201).json(apiResponse.success(duplicate, 'Resume duplicated successfully'));
    } catch (error) {
      logger.error('Error in duplicate resume:', error);
      next(error);
    }
  }

  /**
   * Update resume status
   */
  async updateStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;
      const { status } = req.body;

      if (!['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json(apiResponse.error('Invalid status'));
      }

      const resume = await resumeService.updateResumeStatus(resumeId, userId, status);

      res.json(apiResponse.success(resume, 'Resume status updated successfully'));
    } catch (error) {
      logger.error('Error in update status:', error);
      next(error);
    }
  }

  /**
   * Make resume public
   */
  async makePublic(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;

      const result = await resumeService.makeResumePublic(resumeId, userId);

      res.json(apiResponse.success(result, 'Resume is now public'));
    } catch (error) {
      logger.error('Error in make public:', error);
      next(error);
    }
  }

  /**
   * Get public resume (no auth required)
   */
  async getPublic(req, res, next) {
    try {
      const { publicUrl } = req.params;

      const resume = await resumeService.getPublicResume(publicUrl);

      res.json(apiResponse.success(resume, 'Public resume retrieved'));
    } catch (error) {
      logger.error('Error in get public resume:', error);
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getStatistics(req, res, next) {
    try {
      const userId = req.user.id;

      const stats = await resumeService.getUserStatistics(userId);

      res.json(apiResponse.success(stats, 'Statistics retrieved successfully'));
    } catch (error) {
      logger.error('Error in get statistics:', error);
      next(error);
    }
  }

  /**
   * Search resumes
   */
  async search(req, res, next) {
    try {
      const userId = req.user.id;
      const searchParams = {
        query: req.query.q,
        template: req.query.template,
        status: req.query.status,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await resumeService.searchResumes(userId, searchParams);

      res.json(apiResponse.success(result, 'Search results retrieved'));
    } catch (error) {
      logger.error('Error in search resumes:', error);
      next(error);
    }
  }

  /**
   * Export resume as PDF
   */
  async exportPDF(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;
      const template = req.query.template || 'modern';

      const resume = await resumeService.getResumeById(resumeId, userId);
      const { buffer, filename, mimeType } = await exportService.exportToPDF(resume, template);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      logger.error('Error in export PDF:', error);
      next(error);
    }
  }

  /**
   * Export resume as DOCX
   */
  async exportDOCX(req, res, next) {
    try {
      const userId = req.user.id;
      const { resumeId } = req.params;

      const resume = await resumeService.getResumeById(resumeId, userId);
      const { buffer, filename, mimeType } = await exportService.exportToDOCX(resume);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      logger.error('Error in export DOCX:', error);
      next(error);
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        isPremium: req.query.isPremium === 'true' ? true : req.query.isPremium === 'false' ? false : undefined,
      };

      const templates = await resumeService.getTemplates(filters);

      res.json(apiResponse.success(templates, 'Templates retrieved successfully'));
    } catch (error) {
      logger.error('Error in get templates:', error);
      next(error);
    }
  }

  /**
   * Get template by name
   */
  async getTemplate(req, res, next) {
    try {
      const { templateName } = req.params;

      const template = await resumeService.getTemplateByName(templateName);

      res.json(apiResponse.success(template, 'Template retrieved successfully'));
    } catch (error) {
      logger.error('Error in get template:', error);
      next(error);
    }
  }
}

module.exports = new ResumeController();
