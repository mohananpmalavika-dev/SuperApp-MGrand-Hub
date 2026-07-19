const fs = require('fs').promises;
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

class StorageService {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local'; // 'local' or 's3'
    
    if (this.storageType === 's3') {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      this.bucket = process.env.S3_BUCKET;
    }

    this.baseUrl = process.env.BASE_URL || 'http://localhost:3007';
  }

  /**
   * Upload single file
   */
  async uploadFile(file) {
    try {
      if (this.storageType === 's3') {
        return await this.uploadToS3(file);
      } else {
        return await this.uploadToLocal(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files) {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  /**
   * Upload to local storage
   */
  async uploadToLocal(file) {
    const relativePath = file.path.replace(/\\/g, '/');
    const url = `${this.baseUrl}/${relativePath}`;

    // Optimize images
    if (file.mimetype.startsWith('image/')) {
      await this.optimizeImage(file.path);
      
      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(file.path);
      const thumbnailUrl = `${this.baseUrl}/${thumbnailPath.replace(/\\/g, '/')}`;

      return {
        url,
        thumbnailUrl,
        type: 'image',
        size: file.size,
        mimetype: file.mimetype,
        filename: file.filename
      };
    }

    return {
      url,
      type: this.getFileType(file.mimetype),
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename
    };
  }

  /**
   * Upload to S3
   */
  async uploadToS3(file) {
    const fileContent = await fs.readFile(file.path);
    const key = `messaging/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });

    await this.s3Client.send(command);

    const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Delete local file after S3 upload
    await fs.unlink(file.path);

    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      const thumbnailKey = `messaging/thumbnails/${Date.now()}-${file.originalname}`;
      const thumbnail = await this.createThumbnail(fileContent);
      
      const thumbnailCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: file.mimetype,
        ACL: 'public-read'
      });

      await this.s3Client.send(thumbnailCommand);

      const thumbnailUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;

      return {
        url,
        thumbnailUrl,
        type: 'image',
        size: file.size,
        mimetype: file.mimetype,
        filename: file.originalname
      };
    }

    return {
      url,
      type: this.getFileType(file.mimetype),
      size: file.size,
      mimetype: file.mimetype,
      filename: file.originalname
    };
  }

  /**
   * Optimize image
   */
  async optimizeImage(filePath) {
    try {
      await sharp(filePath)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(filePath + '.optimized');

      // Replace original with optimized
      await fs.unlink(filePath);
      await fs.rename(filePath + '.optimized', filePath);
    } catch (error) {
      console.error('Image optimization error:', error);
      // Continue with original file if optimization fails
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(filePath) {
    const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '-thumb$1');

    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  /**
   * Create thumbnail buffer
   */
  async createThumbnail(buffer) {
    return await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * Delete file
   */
  async deleteFile(fileUrl) {
    try {
      if (this.storageType === 's3') {
        const key = fileUrl.split('.com/')[1];
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key
        });
        await this.s3Client.send(command);
      } else {
        const filePath = fileUrl.replace(this.baseUrl, '.');
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Delete file error:', error);
      // Continue even if deletion fails
    }
  }

  /**
   * Get file type from mimetype
   */
  getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'document';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    return 'file';
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf']
    } = options;

    // Check size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${this.formatFileSize(maxSize)}`);
    }

    // Check type
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (!isAllowed) {
      throw new Error('File type not allowed');
    }

    return true;
  }
}

module.exports = new StorageService();
