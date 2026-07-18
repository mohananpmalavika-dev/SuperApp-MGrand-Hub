const Resume = require('../models/Resume.model');
const Template = require('../models/Template.model');
const logger = require('../../../packages/shared/src/logger');

/**
 * Resume Service
 * Business logic for resume operations
 */
class ResumeService {
  /**
   * Create a new resume
   */
  async createResume(userId, resumeData) {
    try {
      const resume = new Resume({
        userId,
        ...resumeData,
      });

      await resume.save();
      logger.info(`Resume created: ${resume._id} for user: ${userId}`);
      
      return resume;
    } catch (error) {
      logger.error('Error creating resume:', error);
      throw error;
    }
  }

  /**
   * Get resume by ID
   */
  async getResumeById(resumeId, userId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });
      
      if (!resume) {
        throw new Error('Resume not found');
      }

      return resume;
    } catch (error) {
      logger.error('Error fetching resume:', error);
      throw error;
    }
  }

  /**
   * Get all resumes for a user
   */
  async getUserResumes(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { 'personalInfo.firstName': { $regex: filters.search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const resumes = await Resume.find(query)
        .sort({ updatedAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      const total = await Resume.countDocuments(query);

      return {
        resumes,
        total,
        page: Math.floor((filters.skip || 0) / (filters.limit || 50)) + 1,
        pages: Math.ceil(total / (filters.limit || 50)),
      };
    } catch (error) {
      logger.error('Error fetching user resumes:', error);
      throw error;
    }
  }

  /**
   * Update resume
   */
  async updateResume(resumeId, userId, updates) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      // Update fields
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined && key !== '_id' && key !== 'userId') {
          resume[key] = updates[key];
        }
      });

      // Increment version
      resume.version += 1;

      await resume.save();
      logger.info(`Resume updated: ${resumeId}`);

      return resume;
    } catch (error) {
      logger.error('Error updating resume:', error);
      throw error;
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId, userId) {
    try {
      const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      logger.info(`Resume deleted: ${resumeId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting resume:', error);
      throw error;
    }
  }

  /**
   * Duplicate resume
   */
  async duplicateResume(resumeId, userId) {
    try {
      const original = await Resume.findOne({ _id: resumeId, userId });

      if (!original) {
        throw new Error('Resume not found');
      }

      const duplicate = new Resume({
        ...original.toObject(),
        _id: undefined,
        title: `${original.title} (Copy)`,
        createdAt: undefined,
        updatedAt: undefined,
        version: 1,
        exportCount: 0,
        views: 0,
        publicUrl: undefined,
      });

      await duplicate.save();
      logger.info(`Resume duplicated: ${resumeId} -> ${duplicate._id}`);

      return duplicate;
    } catch (error) {
      logger.error('Error duplicating resume:', error);
      throw error;
    }
  }

  /**
   * Change resume status
   */
  async updateResumeStatus(resumeId, userId, status) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      resume.status = status;
      await resume.save();

      logger.info(`Resume status updated: ${resumeId} -> ${status}`);
      return resume;
    } catch (error) {
      logger.error('Error updating resume status:', error);
      throw error;
    }
  }

  /**
   * Make resume public and generate shareable link
   */
  async makeResumePublic(resumeId, userId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      resume.isPublic = true;
      resume.generatePublicUrl();
      await resume.save();

      logger.info(`Resume made public: ${resumeId}`);
      return {
        publicUrl: resume.publicUrl,
        fullUrl: `${process.env.FRONTEND_URL}/resume/view/${resume.publicUrl}`,
      };
    } catch (error) {
      logger.error('Error making resume public:', error);
      throw error;
    }
  }

  /**
   * Get public resume by URL
   */
  async getPublicResume(publicUrl) {
    try {
      const resume = await Resume.findOne({ publicUrl, isPublic: true });

      if (!resume) {
        throw new Error('Resume not found or not public');
      }

      await resume.recordView();
      return resume;
    } catch (error) {
      logger.error('Error fetching public resume:', error);
      throw error;
    }
  }

  /**
   * Get resume statistics for user
   */
  async getUserStatistics(userId) {
    try {
      const total = await Resume.countDocuments({ userId });
      const drafts = await Resume.countDocuments({ userId, status: 'draft' });
      const published = await Resume.countDocuments({ userId, status: 'published' });
      const archived = await Resume.countDocuments({ userId, status: 'archived' });

      const resumes = await Resume.find({ userId });
      const totalExports = resumes.reduce((sum, r) => sum + r.exportCount, 0);
      const totalViews = resumes.reduce((sum, r) => sum + r.views, 0);

      const recentResumes = await Resume.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status updatedAt template');

      return {
        total,
        byStatus: { drafts, published, archived },
        totalExports,
        totalViews,
        recentResumes,
      };
    } catch (error) {
      logger.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  /**
   * Search resumes with filters
   */
  async searchResumes(userId, searchParams) {
    try {
      const {
        query,
        template,
        status,
        tags,
        dateFrom,
        dateTo,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = searchParams;

      const filter = { userId };

      // Text search
      if (query) {
        filter.$text = { $search: query };
      }

      // Template filter
      if (template) {
        filter.template = template;
      }

      // Status filter
      if (status) {
        filter.status = status;
      }

      // Tags filter
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      const resumes = await Resume.find(filter)
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await Resume.countDocuments(filter);

      return {
        resumes,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Error searching resumes:', error);
      throw error;
    }
  }

  /**
   * Get all available templates
   */
  async getTemplates(filters = {}) {
    try {
      const query = { isActive: true };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
      }

      const templates = await Template.find(query).sort({ usageCount: -1 });
      return templates;
    } catch (error) {
      logger.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get template by name
   */
  async getTemplateByName(templateName) {
    try {
      const template = await Template.findOne({ name: templateName, isActive: true });
      
      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    } catch (error) {
      logger.error('Error fetching template:', error);
      throw error;
    }
  }
}

module.exports = new ResumeService();
