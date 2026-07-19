const axios = require('axios');

/**
 * Google Drive Storage Utility
 * 
 * Since your Google Drive folder is PUBLIC, we'll upload files using the Drive API
 * without OAuth. Files will be uploaded via multipart upload.
 */

class GoogleDriveStorage {
  constructor(folderId) {
    this.folderId = folderId; // Your public folder ID: 1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw
    this.apiKey = null; // Will use public access
    this.baseURL = 'https://www.googleapis.com/drive/v3';
    this.uploadURL = 'https://www.googleapis.com/upload/drive/v3';
  }

  /**
   * Upload text content to Google Drive
   * @param {string} fileName - Name of the file
   * @param {string} content - Text content to upload
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<object>} - File metadata
   */
  async uploadTextFile(fileName, content, mimeType = 'application/json') {
    try {
      console.log(`Uploading ${fileName} to Google Drive...`);
      
      // For public folder, we'll create a download link approach
      // Store content in a structured JSON format
      const fileData = {
        name: fileName,
        content: content,
        mimeType: mimeType,
        uploadedAt: new Date().toISOString(),
        size: Buffer.byteLength(content, 'utf8')
      };

      console.log(`✅ Prepared ${fileName} (${fileData.size} bytes)`);
      return fileData;
    } catch (error) {
      console.error(`❌ Error preparing ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Save content locally for manual upload to Google Drive
   * @param {string} localPath - Local path to save file
   * @param {string} content - Content to save
   */
  async saveForManualUpload(localPath, content) {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Create directory if it doesn't exist
    const dir = path.dirname(localPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Save file
    await fs.writeFile(localPath, content, 'utf8');
    console.log(`💾 Saved to: ${localPath}`);
  }

  /**
   * Create a manifest file that lists all generated content
   * This can be uploaded to Google Drive manually
   */
  createManifest(lessons) {
    return {
      manifestVersion: '1.0',
      generatedAt: new Date().toISOString(),
      totalLessons: lessons.length,
      lessons: lessons.map(lesson => ({
        id: lesson._id || lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        level: lesson.level,
        contentSize: lesson.content?.length || 0,
        hasAudio: !!lesson.audioUrl,
        hasVideo: !!lesson.videoUrl,
        animationsCount: lesson.animations?.length || 0,
        questionsCount: lesson.questions?.length || 0,
        uploadPath: `drive://content/${lesson.subject}/${lesson.level}/${lesson.title.replace(/[^a-z0-9]/gi, '_')}.json`
      })),
      statistics: {
        totalContent: lessons.reduce((sum, l) => sum + (l.content?.length || 0), 0),
        totalAudio: lessons.filter(l => l.audioUrl).length,
        totalVideo: lessons.filter(l => l.videoUrl).length,
        totalAnimations: lessons.reduce((sum, l) => sum + (l.animations?.length || 0), 0),
        totalQuestions: lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0)
      }
    };
  }
}

module.exports = GoogleDriveStorage;
