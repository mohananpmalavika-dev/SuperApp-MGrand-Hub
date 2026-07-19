const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:3013/api/education';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function validateCourse(courseId, courseName, expectedLessons) {
  log(`\n📚 Validating: ${courseName}`, 'blue');
  log(`   Expected Lessons: ${expectedLessons}`);

  const issues = [];
  
  try {
    // Fetch course
    const courseRes = await axios.get(`${API_BASE}/courses/${courseId}`);
    const course = courseRes.data;

    log(`   ✓ Course found: ${course.title}`);

    // Fetch lessons
    const lessonsRes = await axios.get(`${API_BASE}/courses/${courseId}/lessons`);
    const lessons = lessonsRes.data.lessons || lessonsRes.data;

    const actualLessons = lessons.length;
    log(`   📖 Lessons: ${actualLessons}/${expectedLessons}`);

    if (actualLessons < expectedLessons) {
      issues.push(`Missing ${expectedLessons - actualLessons} lessons`);
    }

    // Validate each lesson
    let validLessons = 0;
    let lessonIssues = 0;

    for (const lesson of lessons) {
      const lessonProblems = [];

      // Check content
      if (!lesson.content || lesson.content.length < 1500) {
        lessonProblems.push('Content too short or missing');
      }

      // Check questions
      if (!lesson.questions || lesson.questions.length < 5) {
        lessonProblems.push('Insufficient questions');
      }

      // Check media (if applicable)
      if (lesson.audioUrl && !lesson.audioUrl.startsWith('http')) {
        lessonProblems.push('Invalid audio URL');
      }

      if (lesson.videoUrl && !lesson.videoUrl.startsWith('http')) {
        lessonProblems.push('Invalid video URL');
      }

      if (lessonProblems.length === 0) {
        validLessons++;
      } else {
        lessonIssues++;
        issues.push(`Lesson "${lesson.title}": ${lessonProblems.join(', ')}`);
      }
    }

    log(`   ✓ Valid Lessons: ${validLessons}/${actualLessons}`);
    if (lessonIssues > 0) {
      log(`   ⚠️  Issues Found: ${lessonIssues}`, 'yellow');
    }

    return {
      courseName,
      courseId,
      expectedLessons,
      actualLessons,
      validLessons,
      issues
    };

  } catch (error) {
    log(`   ✗ Error: ${error.response?.data?.message || error.message}`, 'red');
    return {
      courseName,
      courseId,
      error: error.message,
      issues: ['Failed to fetch course data']
    };
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🔍 CONTENT VALIDATION', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const startTime = Date.now();

  // Load summaries to get course IDs
  const summaries = {
    caFoundation: fs.existsSync(path.join(__dirname, 'generation-summary.json'))
      ? JSON.parse(fs.readFileSync(path.join(__dirname, 'generation-summary.json'), 'utf8'))
      : null,
    jeePhysics: fs.existsSync(path.join(__dirname, 'jee-physics-summary.json'))
      ? JSON.parse(fs.readFileSync(path.join(__dirname, 'jee-physics-summary.json'), 'utf8'))
      : null,
    cbse10: fs.existsSync(path.join(__dirname, 'cbse-10-summary.json'))
      ? JSON.parse(fs.readFileSync(path.join(__dirname, 'cbse-10-summary.json'), 'utf8'))
      : null,
    iasPrelims: fs.existsSync(path.join(__dirname, 'ias-prelims-summary.json'))
      ? JSON.parse(fs.readFileSync(path.join(__dirname, 'ias-prelims-summary.json'), 'utf8'))
      : null
  };

  const courses = [];

  if (summaries.caFoundation) {
    courses.push({
      id: summaries.caFoundation.courses[0]?.courseId,
      name: 'CA Foundation',
      expected: 40
    });
  }

  if (summaries.jeePhysics) {
    courses.push({
      id: summaries.jeePhysics.courseId,
      name: 'JEE Main Physics',
      expected: 30
    });
  }

  if (summaries.cbse10) {
    courses.push({
      id: summaries.cbse10.courseId,
      name: 'CBSE Class 10 Math',
      expected: 16
    });
  }

  if (summaries.iasPrelims) {
    courses.push({
      id: summaries.iasPrelims.courseId,
      name: 'IAS Prelims',
      expected: 36
    });
  }

  if (courses.length === 0) {
    log('❌ No course summaries found. Run generation scripts first.\n', 'red');
    process.exit(1);
  }

  log(`Found ${courses.length} courses to validate\n`);

  const results = [];

  for (const course of courses) {
    if (!course.id) {
      log(`⚠️  Skipping ${course.name} - No course ID found`, 'yellow');
      continue;
    }

    const result = await validateCourse(course.id, course.name, course.expected);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  // Final Summary
  log('\n' + '='.repeat(60), 'bright');
  log('📊 VALIDATION SUMMARY', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const totalExpected = results.reduce((sum, r) => sum + (r.expectedLessons || 0), 0);
  const totalActual = results.reduce((sum, r) => sum + (r.actualLessons || 0), 0);
  const totalValid = results.reduce((sum, r) => sum + (r.validLessons || 0), 0);
  const totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);

  log(`⏱️  Validation Time: ${duration} seconds`);
  log(`📚 Courses Validated: ${results.filter(r => !r.error).length}/${courses.length}`);
  log(`📖 Total Lessons: ${totalActual}/${totalExpected} (${((totalActual/totalExpected)*100).toFixed(1)}%)`);
  log(`✅ Valid Lessons: ${totalValid}/${totalActual} (${((totalValid/totalActual)*100).toFixed(1)}%)`);
  log(`⚠️  Total Issues: ${totalIssues}\n`);

  // Detailed Results
  if (totalIssues > 0) {
    log('🔍 Detailed Issues:', 'yellow');
    log('');

    results.forEach(result => {
      if (result.issues && result.issues.length > 0) {
        log(`   ${result.courseName}:`, 'yellow');
        result.issues.slice(0, 5).forEach(issue => {
          log(`      • ${issue}`, 'yellow');
        });
        if (result.issues.length > 5) {
          log(`      • ... and ${result.issues.length - 5} more issues`, 'yellow');
        }
        log('');
      }
    });
  }

  // Save validation report
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration} seconds`,
    summary: {
      coursesValidated: results.filter(r => !r.error).length,
      totalCourses: courses.length,
      totalExpectedLessons: totalExpected,
      totalActualLessons: totalActual,
      totalValidLessons: totalValid,
      totalIssues,
      completionPercentage: ((totalActual / totalExpected) * 100).toFixed(1),
      qualityPercentage: ((totalValid / totalActual) * 100).toFixed(1)
    },
    results
  };

  fs.writeFileSync(
    path.join(__dirname, 'validation-report.json'),
    JSON.stringify(report, null, 2)
  );

  log('💾 Validation report saved to validation-report.json\n');

  // Recommendations
  log('🎯 Recommendations:', 'cyan');
  log('');

  if (totalActual < totalExpected) {
    log('   ⚠️  Re-run generation for courses with missing lessons', 'yellow');
  }

  if (totalValid < totalActual) {
    log('   ⚠️  Review and fix lessons with quality issues', 'yellow');
  }

  if (totalIssues === 0 && totalActual === totalExpected) {
    log('   ✅ All content is valid and complete!', 'green');
    log('   ✅ Ready for frontend testing', 'green');
    log('   ✅ Ready for beta launch', 'green');
  }

  log('');
  log('='.repeat(60) + '\n', 'bright');

  process.exit(totalIssues > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { validateCourse };
