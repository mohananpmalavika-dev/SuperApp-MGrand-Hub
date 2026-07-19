/**
 * Test CA Foundation Google Drive Integration
 * Run this to verify the setup is working
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3013/api/education/ca-foundation';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

async function testAPI() {
  log.section('Testing CA Foundation API Integration');

  try {
    // Test 1: Health Check
    log.info('Test 1: Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    if (healthResponse.data.success) {
      log.success(`Health check passed - Mode: ${healthResponse.data.mode}`);
      log.info(`  Courses available: ${healthResponse.data.coursesAvailable}`);
      log.info(`  Google Drive configured: ${healthResponse.data.googleDriveConfigured}`);
    } else {
      log.error('Health check failed');
      return;
    }

    // Test 2: Get All Courses
    log.info('\nTest 2: Get All Courses...');
    const coursesResponse = await axios.get(`${API_BASE}/courses`);
    if (coursesResponse.data.success) {
      log.success(`Found ${coursesResponse.data.count} courses`);
      coursesResponse.data.data.forEach(course => {
        log.info(`  • ${course.title} (${course.totalLessons} lessons) - ₹${course.price}`);
      });
    } else {
      log.error('Failed to fetch courses');
    }

    // Test 3: Get Specific Course
    log.info('\nTest 3: Get Accounting Course Details...');
    const courseResponse = await axios.get(`${API_BASE}/courses/ca-f-accounting`);
    if (courseResponse.data.success) {
      const course = courseResponse.data.data;
      log.success(`Course loaded: ${course.title}`);
      log.info(`  Total lessons: ${course.totalLessons}`);
      log.info(`  Total duration: ${course.duration} minutes`);
      log.info(`  Modules: ${course.modules.length}`);
      course.modules.forEach(module => {
        log.info(`    - Module ${module.moduleNumber}: ${module.lessons.length} lessons`);
      });
    } else {
      log.error('Failed to fetch course details');
    }

    // Test 4: Get Specific Lesson
    log.info('\nTest 4: Get First Lesson...');
    const lessonResponse = await axios.get(`${API_BASE}/courses/ca-f-accounting/lessons/0`);
    if (lessonResponse.data.success) {
      const lesson = lessonResponse.data.data;
      log.success(`Lesson loaded: ${lesson.topic}`);
      log.info(`  Duration: ${lesson.duration} minutes`);
      log.info(`  Key concepts: ${lesson.keyConcepts?.length || 0}`);
      log.info(`  Solved examples: ${lesson.solvedExamples?.length || 0}`);
      log.info(`  Practice problems: ${lesson.practiceProblems?.length || 0}`);
    } else {
      log.error('Failed to fetch lesson');
    }

    // Test 5: Search Content
    log.info('\nTest 5: Search for "assets"...');
    const searchResponse = await axios.get(`${API_BASE}/search`, {
      params: { q: 'assets' }
    });
    if (searchResponse.data.success) {
      const results = searchResponse.data.results;
      log.success(`Search results:`);
      log.info(`  Courses found: ${results.courses.length}`);
      log.info(`  Lessons found: ${results.lessons.length}`);
      if (results.lessons.length > 0) {
        log.info(`  Sample lesson: ${results.lessons[0].topic}`);
      }
    } else {
      log.error('Search failed');
    }

    // Test 6: Get Statistics
    log.info('\nTest 6: Get Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/stats`);
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      log.success('Statistics:');
      log.info(`  Total courses: ${stats.totalCourses}`);
      log.info(`  Total lessons: ${stats.totalLessons}`);
      log.info(`  Total duration: ${stats.totalDurationMinutes} minutes (${Math.round(stats.totalDurationMinutes / 60)} hours)`);
      log.info(`  Cache size: ${stats.cacheSize} items`);
      log.info(`  Subjects: ${stats.subjects.join(', ')}`);
    } else {
      log.error('Failed to fetch statistics');
    }

    // Test 7: Get Lesson by Topic
    log.info('\nTest 7: Get Lesson by Topic Name...');
    const topicResponse = await axios.get(
      `${API_BASE}/courses/ca-f-accounting/topics/Introduction%20to%20Accounting`
    );
    if (topicResponse.data.success) {
      const lesson = topicResponse.data.data;
      log.success(`Lesson found: ${lesson.topic}`);
      log.info(`  Module: ${lesson.moduleNumber}`);
      log.info(`  Course: ${lesson.courseTitle}`);
    } else {
      log.error('Failed to fetch lesson by topic');
    }

    log.section('All Tests Completed Successfully! 🎉');
    log.info('Your CA Foundation API is working perfectly!');
    log.info('\nNext steps:');
    log.info('1. Integrate with your frontend');
    log.info('2. Build course listing page');
    log.info('3. Build lesson viewer page');
    log.info('4. (Optional) Set up Google Drive integration');
    log.info('\nRead the full guide: GOOGLE_DRIVE_SETUP_GUIDE.md');

  } catch (error) {
    log.error(`\nError: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    if (error.code === 'ECONNREFUSED') {
      log.warn('\nMake sure the education service is running:');
      log.info('  cd services/education-service');
      log.info('  npm start');
    }
  }
}

// Run the tests
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
