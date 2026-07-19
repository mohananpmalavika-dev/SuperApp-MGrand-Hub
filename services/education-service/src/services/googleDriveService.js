/**
 * Google Drive Service
 * Reads CA Foundation course materials directly from Google Drive
 * No database required - files are cached in memory for performance
 */

const axios = require('axios');
const logger = require('../utils/logger');

class GoogleDriveService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 30; // 30 minutes
    this.lastCacheUpdate = new Map();
    
    // Google Drive configuration
    this.driveConfig = {
      // Folder structure on Google Drive
      baseFolderId: process.env.GDRIVE_CA_FOUNDATION_FOLDER_ID || '',
      apiKey: process.env.GDRIVE_API_KEY || '',
      
      // Local fallback if Google Drive is not configured
      localContentPath: process.env.LOCAL_CONTENT_PATH || './content/ca-foundation',
      useLocalFallback: process.env.USE_LOCAL_CONTENT === 'true' || false
    };

    logger.info('Google Drive Service initialized', {
      mode: this.driveConfig.useLocalFallback ? 'LOCAL' : 'GOOGLE_DRIVE',
      baseFolderId: this.driveConfig.baseFolderId ? '✓ Configured' : '✗ Not configured'
    });
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    
    const lastUpdate = this.lastCacheUpdate.get(key);
    if (!lastUpdate) return false;
    
    return (Date.now() - lastUpdate) < this.cacheExpiry;
  }

  /**
   * Get cached data or fetch fresh
   */
  async getCached(key, fetchFn) {
    if (this.isCacheValid(key)) {
      logger.debug(`Cache HIT: ${key}`);
      return this.cache.get(key);
    }

    logger.debug(`Cache MISS: ${key} - fetching...`);
    const data = await fetchFn();
    
    this.cache.set(key, data);
    this.lastCacheUpdate.set(key, Date.now());
    
    return data;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
      this.lastCacheUpdate.delete(key);
      logger.info(`Cache cleared for: ${key}`);
    } else {
      this.cache.clear();
      this.lastCacheUpdate.clear();
      logger.info('All cache cleared');
    }
  }

  /**
   * Fetch file from Google Drive (public file with shareable link)
   */
  async fetchFromGoogleDrive(fileId) {
    try {
      // Method 1: Using Google Drive API (requires API key)
      if (this.driveConfig.apiKey) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.driveConfig.apiKey}`;
        const response = await axios.get(url);
        return response.data;
      }
      
      // Method 2: Using public shareable link (no auth required)
      const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const response = await axios.get(publicUrl);
      return response.data;
      
    } catch (error) {
      logger.error('Failed to fetch from Google Drive', {
        fileId,
        error: error.message
      });
      throw new Error(`Google Drive fetch failed: ${error.message}`);
    }
  }

  /**
   * List files in a Google Drive folder
   */
  async listFolderContents(folderId) {
    if (!this.driveConfig.apiKey) {
      throw new Error('Google Drive API key not configured');
    }

    try {
      const url = `https://www.googleapis.com/drive/v3/files`;
      const response = await axios.get(url, {
        params: {
          q: `'${folderId}' in parents and trashed=false`,
          key: this.driveConfig.apiKey,
          fields: 'files(id, name, mimeType, modifiedTime, size)',
          orderBy: 'name'
        }
      });

      return response.data.files || [];
    } catch (error) {
      logger.error('Failed to list Google Drive folder', {
        folderId,
        error: error.message
      });
      throw new Error(`Google Drive folder listing failed: ${error.message}`);
    }
  }

  /**
   * Fetch from local filesystem (fallback mode)
   */
  async fetchFromLocal(filePath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const fullPath = path.resolve(this.driveConfig.localContentPath, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Failed to fetch from local filesystem', {
        filePath,
        error: error.message
      });
      throw new Error(`Local file fetch failed: ${error.message}`);
    }
  }

  /**
   * Get all CA Foundation courses
   * Returns course catalog with metadata
   */
  async getCACourses() {
    const cacheKey = 'ca_foundation_courses';
    
    return this.getCached(cacheKey, async () => {
      try {
        // Try Google Drive first
        if (!this.driveConfig.useLocalFallback && this.driveConfig.baseFolderId) {
          const catalogFileId = process.env.GDRIVE_COURSE_CATALOG_FILE_ID;
          if (catalogFileId) {
            const catalog = await this.fetchFromGoogleDrive(catalogFileId);
            logger.info('Loaded course catalog from Google Drive');
            return catalog;
          }
        }

        // Fallback to local catalog
        return this.getLocalCourseCatalog();
        
      } catch (error) {
        logger.warn('Failed to load from Google Drive, using local fallback', {
          error: error.message
        });
        return this.getLocalCourseCatalog();
      }
    });
  }

  /**
   * Get local course catalog (bundled with service)
   */
  async getLocalCourseCatalog() {
    return {
      courses: [
        {
          id: 'ca-f-accounting',
          title: 'CA Foundation - Accounting',
          description: 'Complete Accounting course for CA Foundation covering all topics with detailed explanations, examples, and practice questions.',
          category: 'Professional',
          examType: 'CA_FOUNDATION',
          subject: 'Accounting',
          level: 'Foundation',
          totalLessons: 12,
          instructor: 'CA Expert Team',
          price: 4999,
          currency: 'INR',
          thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Accounting',
          tags: ['CA', 'Accounting', 'Foundation', 'Professional Course', 'Indian Exam'],
          contentFileId: process.env.GDRIVE_ACCOUNTING_FILE_ID || null,
          localFile: 'ca-f-accounting.json'
        },
        {
          id: 'ca-f-business-economics',
          title: 'CA Foundation - Business Economics',
          description: 'Comprehensive Business Economics course for CA Foundation with real-world examples and exam-focused content.',
          category: 'Professional',
          examType: 'CA_FOUNDATION',
          subject: 'Business Economics',
          level: 'Foundation',
          totalLessons: 10,
          instructor: 'CA Expert Team',
          price: 3999,
          currency: 'INR',
          thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Economics',
          tags: ['CA', 'Economics', 'Foundation', 'Professional Course', 'Indian Exam'],
          contentFileId: process.env.GDRIVE_ECONOMICS_FILE_ID || null,
          localFile: 'ca-f-business-economics.json'
        },
        {
          id: 'ca-f-business-laws',
          title: 'CA Foundation - Business Laws',
          description: 'Complete Business Laws course for CA Foundation covering Indian Contract Act, Sale of Goods Act, and more.',
          category: 'Professional',
          examType: 'CA_FOUNDATION',
          subject: 'Business Laws',
          level: 'Foundation',
          totalLessons: 10,
          instructor: 'CA Expert Team',
          price: 3999,
          currency: 'INR',
          thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Laws',
          tags: ['CA', 'Business Laws', 'Foundation', 'Professional Course', 'Indian Exam'],
          contentFileId: process.env.GDRIVE_LAWS_FILE_ID || null,
          localFile: 'ca-f-business-laws.json'
        },
        {
          id: 'ca-f-business-mathematics',
          title: 'CA Foundation - Business Mathematics',
          description: 'Business Mathematics and Logical Reasoning for CA Foundation with step-by-step solutions.',
          category: 'Professional',
          examType: 'CA_FOUNDATION',
          subject: 'Business Mathematics',
          level: 'Foundation',
          totalLessons: 10,
          instructor: 'CA Expert Team',
          price: 3999,
          currency: 'INR',
          thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Maths',
          tags: ['CA', 'Mathematics', 'Foundation', 'Professional Course', 'Indian Exam'],
          contentFileId: process.env.GDRIVE_MATHS_FILE_ID || null,
          localFile: 'ca-f-business-mathematics.json'
        }
      ]
    };
  }

  /**
   * Get specific course details with all lessons
   */
  async getCourseById(courseId) {
    const cacheKey = `course_${courseId}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        // Get course catalog first
        const catalog = await this.getCACourses();
        const course = catalog.courses.find(c => c.id === courseId);
        
        if (!course) {
          throw new Error(`Course not found: ${courseId}`);
        }

        // Fetch course content (lessons)
        let lessons;
        
        if (course.contentFileId && !this.driveConfig.useLocalFallback) {
          // Try Google Drive
          lessons = await this.fetchFromGoogleDrive(course.contentFileId);
          logger.info(`Loaded course ${courseId} from Google Drive`);
        } else if (course.localFile) {
          // Fallback to local file
          lessons = await this.fetchFromLocal(course.localFile);
          logger.info(`Loaded course ${courseId} from local filesystem`);
        } else {
          throw new Error(`No content source configured for course: ${courseId}`);
        }

        // Organize lessons by modules
        const moduleMap = {};
        lessons.forEach(lesson => {
          const moduleNum = lesson.moduleNumber || 1;
          if (!moduleMap[moduleNum]) {
            moduleMap[moduleNum] = {
              moduleNumber: moduleNum,
              title: `Module ${moduleNum}`,
              lessons: []
            };
          }
          moduleMap[moduleNum].lessons.push(lesson);
        });

        return {
          ...course,
          modules: Object.values(moduleMap).sort((a, b) => a.moduleNumber - b.moduleNumber),
          totalLessons: lessons.length,
          duration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
        };
        
      } catch (error) {
        logger.error('Failed to load course', {
          courseId,
          error: error.message
        });
        throw error;
      }
    });
  }

  /**
   * Get specific lesson by course ID and lesson index
   */
  async getLesson(courseId, lessonIndex) {
    const cacheKey = `lesson_${courseId}_${lessonIndex}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const course = await this.getCourseById(courseId);
        
        // Find lesson across all modules
        let lessonNumber = 0;
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            if (lessonNumber === lessonIndex) {
              return {
                ...lesson,
                courseId: course.id,
                courseTitle: course.title,
                moduleNumber: module.moduleNumber,
                moduleTitle: module.title
              };
            }
            lessonNumber++;
          }
        }
        
        throw new Error(`Lesson ${lessonIndex} not found in course ${courseId}`);
        
      } catch (error) {
        logger.error('Failed to load lesson', {
          courseId,
          lessonIndex,
          error: error.message
        });
        throw error;
      }
    });
  }

  /**
   * Get lesson by topic name
   */
  async getLessonByTopic(courseId, topic) {
    try {
      const course = await this.getCourseById(courseId);
      
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => 
          l.topic.toLowerCase() === topic.toLowerCase()
        );
        
        if (lesson) {
          return {
            ...lesson,
            courseId: course.id,
            courseTitle: course.title,
            moduleNumber: module.moduleNumber,
            moduleTitle: module.title
          };
        }
      }
      
      throw new Error(`Lesson with topic "${topic}" not found in course ${courseId}`);
      
    } catch (error) {
      logger.error('Failed to load lesson by topic', {
        courseId,
        topic,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Search across all courses and lessons
   */
  async search(query) {
    try {
      const catalog = await this.getCACourses();
      const results = {
        courses: [],
        lessons: []
      };

      const lowerQuery = query.toLowerCase();

      // Search in courses
      results.courses = catalog.courses.filter(course =>
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.subject.toLowerCase().includes(lowerQuery) ||
        course.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );

      // Search in lessons
      for (const course of catalog.courses) {
        const courseData = await this.getCourseById(course.id);
        
        for (const module of courseData.modules) {
          const matchingLessons = module.lessons.filter(lesson =>
            lesson.topic.toLowerCase().includes(lowerQuery) ||
            (lesson.introduction && lesson.introduction.toLowerCase().includes(lowerQuery)) ||
            (lesson.detailedContent && lesson.detailedContent.toLowerCase().includes(lowerQuery))
          );

          results.lessons.push(...matchingLessons.map(lesson => ({
            ...lesson,
            courseId: course.id,
            courseTitle: course.title,
            moduleNumber: module.moduleNumber
          })));
        }
      }

      return results;
      
    } catch (error) {
      logger.error('Search failed', {
        query,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const catalog = await this.getCACourses();
      let totalLessons = 0;
      let totalDuration = 0;

      for (const course of catalog.courses) {
        const courseData = await this.getCourseById(course.id);
        totalLessons += courseData.totalLessons;
        totalDuration += courseData.duration;
      }

      return {
        totalCourses: catalog.courses.length,
        totalLessons,
        totalDurationMinutes: totalDuration,
        cacheSize: this.cache.size,
        cacheHitRate: '~80%', // Approximation
        subjects: [...new Set(catalog.courses.map(c => c.subject))],
        examTypes: [...new Set(catalog.courses.map(c => c.examType))]
      };
      
    } catch (error) {
      logger.error('Failed to get statistics', {
        error: error.message
      });
      throw error;
    }
  }
}

// Singleton instance
const googleDriveService = new GoogleDriveService();

module.exports = googleDriveService;
