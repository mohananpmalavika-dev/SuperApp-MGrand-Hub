const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Google Drive Content Service
 * 
 * Fetches lesson content from Google Drive instead of storing in MongoDB
 * This keeps MongoDB under 500MB while serving unlimited content from Drive
 */

class DriveContentService {
  constructor() {
    this.cache = new Map(); // In-memory cache
    this.cacheTTL = 3600000; // 1 hour in milliseconds
  }

  /**
   * Fetch content from Google Drive
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Object>} - Parsed JSON content
   */
  async fetchContent(fileId) {
    try {
      // Check cache first
      const cached = this.cache.get(fileId);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        logger.info('Content served from cache', { fileId });
        return cached.data;
      }

      // Fetch from Google Drive
      const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
      
      logger.info('Fetching content from Google Drive', { fileId, url });
      
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: 'json'
      });

      // Cache the result
      this.cache.set(fileId, {
        data: response.data,
        timestamp: Date.now()
      });

      logger.info('Content fetched and cached', { 
        fileId, 
        size: JSON.stringify(response.data).length 
      });

      return response.data;

    } catch (error) {
      logger.error('Error fetching content from Google Drive', {
        fileId,
        error: error.message
      });
      
      if (error.response) {
        logger.error('Drive API error', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw new Error(`Failed to fetch content from Google Drive: ${error.message}`);
    }
  }

  /**
   * Fetch lesson by index from course file
   * @param {string} fileId - Google Drive file ID
   * @param {number} lessonIndex - Index of lesson in array
   * @returns {Promise<Object>} - Lesson content
   */
  async fetchLesson(fileId, lessonIndex) {
    try {
      const content = await this.fetchContent(fileId);

      // Check if content is array of lessons
      if (Array.isArray(content)) {
        if (lessonIndex >= 0 && lessonIndex < content.length) {
          return content[lessonIndex];
        } else {
          throw new Error(`Lesson index ${lessonIndex} out of range (total: ${content.length})`);
        }
      }

      // If content is a course object with modules
      if (content.modules && Array.isArray(content.modules)) {
        // Flatten all lessons from all modules
        const allLessons = [];
        content.modules.forEach(module => {
          if (module.chapters && Array.isArray(module.chapters)) {
            module.chapters.forEach(chapter => {
              allLessons.push({
                ...chapter,
                moduleName: module.moduleName,
                moduleNumber: module.moduleNumber
              });
            });
          }
        });

        if (lessonIndex >= 0 && lessonIndex < allLessons.length) {
          return allLessons[lessonIndex];
        } else {
          throw new Error(`Lesson index ${lessonIndex} out of range (total: ${allLessons.length})`);
        }
      }

      // If content is a single lesson
      return content;

    } catch (error) {
      logger.error('Error fetching lesson', { fileId, lessonIndex, error: error.message });
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Content cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp < this.cacheTTL) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
      ttl: this.cacheTTL
    };
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    logger.info('Cleaned expired cache entries', { cleaned });
    return cleaned;
  }
}

// Export singleton instance
module.exports = new DriveContentService();
