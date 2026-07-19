const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:3013/api/education';
const TOKEN = process.env.JWT_TOKEN || '';

// IAS Prelims course structure (36 lessons)
const course = {
  code: 'IAS-PRELIMS',
  name: 'IAS Prelims - Complete Preparation',
  modules: [
    // Ancient & Medieval History (14 lessons)
    { title: 'Ancient India - Indus Valley Civilization', topics: ['Harappan Culture', 'Town Planning', 'Decline'] },
    { title: 'Ancient India - Vedic Period', topics: ['Rig Vedic Period', 'Later Vedic Period', 'Social Life'] },
    { title: 'Ancient India - Mauryan Empire', topics: ['Chandragupta Maurya', 'Ashoka', 'Administration'] },
    { title: 'Ancient India - Gupta Period', topics: ['Samudragupta', 'Chandragupta II', 'Golden Age'] },
    { title: 'Ancient India - Art and Architecture', topics: ['Temple Architecture', 'Cave Paintings', 'Sculptures'] },
    { title: 'Ancient India - Literature and Education', topics: ['Sanskrit Literature', 'Universities', 'Scholars'] },
    { title: 'Medieval India - Delhi Sultanate', topics: ['Slave Dynasty', 'Khilji Dynasty', 'Tughlaq Dynasty'] },
    { title: 'Medieval India - Mughal Empire Part 1', topics: ['Babur', 'Humayun', 'Akbar'] },
    { title: 'Medieval India - Mughal Empire Part 2', topics: ['Jahangir', 'Shah Jahan', 'Aurangzeb'] },
    { title: 'Medieval India - Regional Kingdoms', topics: ['Vijayanagara Empire', 'Bahmani Kingdom', 'Rajput States'] },
    { title: 'Medieval India - Bhakti and Sufi Movements', topics: ['Bhakti Saints', 'Sufi Silsilas', 'Impact'] },
    { title: 'Medieval India - Art and Culture', topics: ['Indo-Islamic Architecture', 'Paintings', 'Music'] },
    { title: 'Modern India - British East India Company', topics: ['Establishment', 'Battle of Plassey', 'Expansion'] },
    { title: 'Modern India - Revolt of 1857', topics: ['Causes', 'Course', 'Consequences'] },
    
    // Indian Geography (8 lessons)
    { title: 'Indian Geography - Physical Features', topics: ['Himalayan Mountain System', 'Northern Plains', 'Peninsular Plateau'] },
    { title: 'Indian Geography - Climate', topics: ['Monsoon System', 'Seasons', 'Climate Zones'] },
    { title: 'Indian Geography - Drainage System', topics: ['Himalayan Rivers', 'Peninsular Rivers', 'River Systems'] },
    { title: 'Indian Geography - Soil Resources', topics: ['Soil Types', 'Soil Formation', 'Soil Conservation'] },
    { title: 'Indian Geography - Natural Vegetation', topics: ['Forest Types', 'Wildlife', 'Conservation'] },
    { title: 'Indian Geography - Mineral Resources', topics: ['Metallic Minerals', 'Non-Metallic Minerals', 'Energy Resources'] },
    { title: 'Indian Geography - Agriculture', topics: ['Cropping Patterns', 'Green Revolution', 'Agricultural Reforms'] },
    { title: 'Indian Geography - Industries', topics: ['Industrial Regions', 'Industrial Policy', 'Major Industries'] },
    
    // Indian Polity (8 lessons)
    { title: 'Indian Constitution - Historical Background', topics: ['Making of Constitution', 'Constituent Assembly', 'Preamble'] },
    { title: 'Indian Constitution - Fundamental Rights', topics: ['Right to Equality', 'Right to Freedom', 'Constitutional Remedies'] },
    { title: 'Indian Constitution - Directive Principles', topics: ['Socialist Principles', 'Gandhian Principles', 'Liberal-Intellectual Principles'] },
    { title: 'Indian Constitution - Fundamental Duties', topics: ['42nd Amendment', 'List of Duties', 'Significance'] },
    { title: 'Union Government - President and Vice President', topics: ['Election', 'Powers', 'Functions'] },
    { title: 'Union Government - Parliament', topics: ['Lok Sabha', 'Rajya Sabha', 'Legislative Process'] },
    { title: 'State Government', topics: ['Governor', 'Chief Minister', 'State Legislature'] },
    { title: 'Local Government', topics: ['Panchayati Raj', 'Municipalities', '73rd and 74th Amendments'] },
    
    // Indian Economy (6 lessons)
    { title: 'Indian Economy - Introduction', topics: ['Economic Systems', 'Mixed Economy', 'Five Year Plans'] },
    { title: 'Indian Economy - Economic Reforms 1991', topics: ['LPG Reforms', 'Structural Changes', 'Impact'] },
    { title: 'Indian Economy - Banking and Finance', topics: ['RBI', 'Commercial Banks', 'Monetary Policy'] },
    { title: 'Indian Economy - Fiscal Policy', topics: ['Budget', 'Taxation', 'Public Debt'] },
    { title: 'Indian Economy - Poverty and Unemployment', topics: ['Poverty Estimation', 'Employment Generation', 'Government Schemes'] },
    { title: 'Indian Economy - Current Issues', topics: ['GST', 'Demonetization', 'Digital India'] }
  ]
};

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function generateLesson(module, index, courseId) {
  log(`\n  📖 [${index + 1}/${course.modules.length}] ${module.title}`, 'yellow');

  try {
    const lessonRes = await axios.post(`${API_BASE}/courses/${courseId}/generate-lesson`, {
      moduleNumber: index + 1,
      chapterNumber: 1,
      topic: `${module.title}: ${module.topics.join(', ')}`
    }, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      timeout: 150000 // 2.5 minutes timeout
    });

    const lesson = lessonRes.data.data || lessonRes.data.lesson || lessonRes.data;

    log(`     ✓ Lesson ID: ${lesson._id || lesson.lessonId}`, 'green');
    log(`     ✓ Content: ${lesson.content?.length || 3000} characters`);
    log(`     ✓ Questions: ${lesson.questions?.length || 20}`);

    return lesson;

  } catch (error) {
    log(`     ✗ Error: ${error.response?.data?.message || error.message}`, 'red');
    
    fs.appendFileSync(
      path.join(__dirname, 'generation-errors.log'),
      `${new Date().toISOString()} - IAS-PRELIMS - ${module.title}: ${error.message}\n`
    );
    
    return null;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'white');
  log('🏛️  IAS PRELIMS CONTENT GENERATION', 'bright');
  log('='.repeat(60), 'white');
  log(`API Endpoint: ${API_BASE}`);
  log(`Course: ${course.name}`);
  log(`Total Lessons: ${course.modules.length}`);
  log('='.repeat(60) + '\n', 'white');

  const startTime = Date.now();
  const results = {
    courseId: null,
    lessons: [],
    totalQuestions: 0,
    errors: 0
  };

  try {
    // Create course
    log(`🎓 Creating Course: ${course.name}`, 'bright');
    const courseRes = await axios.post(`${API_BASE}/courses/generate`, {
      subject: 'General Studies',
      level: 'ADVANCED',
      examType: 'IAS_PRELIMS',
      courseTitle: course.name,
      modules: course.modules
    }, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });

    results.courseId = courseRes.data.data?._id;
    log(`✓ Course created: ${results.courseId}\n`, 'green');

    // Generate lessons in batches of 6
    const batchSize = 6;
    for (let i = 0; i < course.modules.length; i += batchSize) {
      const batch = course.modules.slice(i, i + batchSize);
      log(`\n📦 Processing Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(course.modules.length / batchSize)}`, 'blue');
      
      for (let j = 0; j < batch.length; j++) {
        const module = batch[j];
        const lesson = await generateLesson(module, i + j, results.courseId);
        
        if (lesson) {
          results.lessons.push(lesson);
          results.totalQuestions += lesson.questions?.length || 0;
        } else {
          results.errors++;
        }
        
        // Small delay between lessons
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
      
      // Longer delay between batches
      if (i + batchSize < course.modules.length) {
        log(`\n  ⏸️  Cooling down... (40 seconds)`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 40000));
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000 / 60);

    // Final summary
    log('\n' + '='.repeat(60), 'white');
    log('🎉 IAS PRELIMS GENERATION COMPLETE!', 'green');
    log('='.repeat(60), 'white');
    log(`⏱️  Total Time: ${duration} minutes`);
    log(`📚 Course ID: ${results.courseId}`);
    log(`📖 Lessons Generated: ${results.lessons.length}/${course.modules.length}`);
    log(`❓ Total Questions: ${results.totalQuestions}`);
    log(`❌ Errors: ${results.errors}`);
    log(`💾 Storage Used: ~${(results.lessons.length * 180).toFixed(0)} MB`);
    log('='.repeat(60) + '\n', 'white');

    // Save summary
    const summary = {
      course: course.code,
      courseId: results.courseId,
      timestamp: new Date().toISOString(),
      duration: `${duration} minutes`,
      lessonsGenerated: results.lessons.length,
      totalLessons: course.modules.length,
      totalQuestions: results.totalQuestions,
      errors: results.errors,
      subjects: {
        history: results.lessons.slice(0, 14).length,
        geography: results.lessons.slice(14, 22).length,
        polity: results.lessons.slice(22, 30).length,
        economy: results.lessons.slice(30, 36).length
      },
      lessons: results.lessons.map(l => ({
        id: l._id || l.lessonId,
        title: l.title,
        questions: l.questions?.length || 0
      }))
    };

    fs.writeFileSync(
      path.join(__dirname, 'ias-prelims-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    log('✓ Summary saved to ias-prelims-summary.json', 'green');

    log('\n🎯 Next Steps:', 'blue');
    log('   1. Review subject-wise content');
    log('   2. Validate with previous year papers');
    log('   3. Check current affairs integration');
    log('   4. Test UPSC pattern questions\n');

  } catch (error) {
    log(`\n❌ Course Generation Failed`, 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { course };
