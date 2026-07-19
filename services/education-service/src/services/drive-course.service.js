/**
 * Google Drive Course Service
 * Fetches course content from Google Drive
 */

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const caCoursesConfig = require('../config/ca-drive-courses');

class DriveCourseService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get all CA Foundation courses
   */
  async getCACourses() {
    const config = caCoursesConfig.init();
    return {
      success: true,
      data: config.courses.map(course => ({
        id: course.id,
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        category: course.category,
        examType: course.examType,
        subject: course.subject,
        level: course.level,
        duration: course.duration,
        totalLessons: course.totalLessons,
        instructor: course.instructor,
        price: course.price,
        currency: course.currency,
        thumbnail: course.thumbnail,
        tags: course.tags,
        rating: course.rating,
        enrolled: course.enrolled,
        featured: course.featured
      }))
    };
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId) {
    const config = caCoursesConfig.init();
    const course = config.courses.find(c => c.id === courseId || c.courseId === courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if we have cached lessons
    const cacheKey = `course_${courseId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return {
        success: true,
        data: {
          ...course,
          lessons: cached.lessons,
          source: cached.source,
          modules: this.organizeLessonsIntoModules(cached.lessons)
        }
      };
    }

    // Prefer Google Drive when configured. The repository copy is a deliberate
    // fallback so a temporary Drive/network failure never removes the course.
    const { lessons, source } = await this.fetchCourseLessons(course);
    
    // Cache the lessons
    this.cache.set(cacheKey, {
      lessons,
      source,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: {
          ...course,
          lessons,
          source,
          modules: this.organizeLessonsIntoModules(lessons)
      }
    };
  }

  /**
   * Get specific lesson
   */
  async getLesson(courseId, lessonIndex) {
    const courseData = await this.getCourseById(courseId);
    const lessons = courseData.data.lessons;
    
    if (!lessons || lessonIndex < 0 || lessonIndex >= lessons.length) {
      throw new Error('Lesson not found');
    }

    return {
      success: true,
      data: {
        ...lessons[lessonIndex],
        navigation: {
          courseId,
          lessonIndex,
          totalLessons: lessons.length,
          hasPrevious: lessonIndex > 0,
          hasNext: lessonIndex < lessons.length - 1
        }
      }
    };
  }

  /**
   * Fetch lessons from Google Drive
   */
  async fetchLessonsFromDrive(fileId) {
    if (!fileId) {
      throw new Error('Drive file ID not configured');
    }

    try {
      // Google Drive direct download URL
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      const response = await axios.get(downloadUrl, {
        timeout: 30000, // 30 seconds
        headers: {
          'User-Agent': 'MGrand-Hub-Education-Service'
        }
      });

      if (Array.isArray(response.data)) {
        return response.data;
      }

      throw new Error('Invalid data format from Drive');
    } catch (error) {
      console.error('Error fetching from Drive:', error.message);
      
      // Return empty array with error info if fetch fails
      throw new Error(`Could not fetch course content: ${error.message}`);
    }
  }

  async fetchCourseLessons(course) {
    if (course.driveFileId) {
      try {
        return {
          lessons: await this.fetchLessonsFromDrive(course.driveFileId),
          source: 'google-drive'
        };
      } catch (error) {
        console.warn(`Drive unavailable for ${course.id}; using bundled course content: ${error.message}`);
      }
    }

    return {
      lessons: await this.fetchLessonsFromLocalFile(course.localFile),
      source: 'bundled'
    };
  }

  async fetchLessonsFromLocalFile(fileName) {
    if (!fileName) {
      throw new Error('Bundled course file not configured');
    }

    const filePath = path.resolve(
      __dirname,
      '../../../../scripts/google-drive-content',
      fileName
    );
    const content = JSON.parse(await fs.readFile(filePath, 'utf8'));

    if (!Array.isArray(content)) {
      throw new Error(`Invalid bundled course format: ${fileName}`);
    }

    return content;
  }

  /**
   * Organize lessons into modules
   */
  organizeLessonsIntoModules(lessons) {
    const moduleMap = {};
    
    lessons.forEach((lesson, index) => {
      const moduleNum = lesson.moduleNumber || 1;
      if (!moduleMap[moduleNum]) {
        moduleMap[moduleNum] = {
          moduleNumber: moduleNum,
          title: `Module ${moduleNum}`,
          lessons: []
        };
      }
      
      moduleMap[moduleNum].lessons.push({
        lessonIndex: index,
        id: `${lesson.subject || 'ca'}-${index}`,
        topic: lesson.topic,
        duration: lesson.duration,
        chapterNumber: lesson.chapterNumber
      });
    });

    return Object.values(moduleMap).sort((a, b) => a.moduleNumber - b.moduleNumber);
  }

  /**
   * Search courses
   */
  async searchCourses(query) {
    const allCourses = await this.getCACourses();
    const searchQuery = query.toLowerCase();
    
    const filtered = allCourses.data.filter(course => 
      course.title.toLowerCase().includes(searchQuery) ||
      course.description.toLowerCase().includes(searchQuery) ||
      course.subject.toLowerCase().includes(searchQuery) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );

    return {
      success: true,
      data: filtered,
      count: filtered.length
    };
  }

  /**
   * Get courses by exam type
   */
  async getCoursesByExamType(examType) {
    const allCourses = await this.getCACourses();
    const filtered = allCourses.data.filter(course => 
      course.examType === examType
    );

    return {
      success: true,
      data: filtered,
      count: filtered.length
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'Cache cleared' };
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      success: true,
      data: {
        cachedCourses: this.cache.size,
        cacheTimeout: this.cacheTimeout / 1000 / 60 + ' minutes'
      }
    };
  }
}

module.exports = new DriveCourseService();
