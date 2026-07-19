const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate Complete CA Foundation Course
 * 
 * This generates all 4 CA Foundation subjects with full AI content:
 * 1. Accounting (12 lessons)
 * 2. Business Laws (10 lessons)
 * 3. Business Mathematics (12 lessons)
 * 4. Business Economics (10 lessons)
 * 
 * Total: 44 complete lessons
 */

const API_BASE = 'http://localhost:3013/api/education';
const OUTPUT_DIR = path.join(__dirname, 'google-drive-content');

// CA Foundation Complete Curriculum
const CA_FOUNDATION = {
  'Accounting': {
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    lessons: [
      'Introduction to Accounting - Concepts and Conventions',
      'Accounting Standards - AS 1 to AS 10',
      'Double Entry System of Book Keeping',
      'Journal Entries - Simple and Compound',
      'Ledger Posting and Balancing',
      'Cash Book - Single Column, Double Column, Triple Column',
      'Purchase Book and Sales Book',
      'Bills of Exchange and Promissory Notes',
      'Trial Balance - Preparation and Uses',
      'Bank Reconciliation Statement',
      'Depreciation Accounting - Methods and Applications',
      'Final Accounts - Trading, P&L, Balance Sheet'
    ]
  },
  'Business Laws': {
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    lessons: [
      'Indian Contract Act 1872 - Offer and Acceptance',
      'Indian Contract Act - Consideration and Capacity',
      'Indian Contract Act - Free Consent and Valid Contracts',
      'Sale of Goods Act 1930 - Sale vs Agreement to Sell',
      'Sale of Goods Act - Conditions and Warranties',
      'Indian Partnership Act 1932 - Formation and Registration',
      'Partnership Act - Rights and Duties of Partners',
      'Limited Liability Partnership Act 2008',
      'Companies Act 2013 - Introduction and Company Formation',
      'Companies Act - Memorandum and Articles of Association'
    ]
  },
  'Business Mathematics': {
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    lessons: [
      'Ratio and Proportion - Theory and Applications',
      'Indices and Surds',
      'Logarithms - Properties and Applications',
      'Linear Equations in One and Two Variables',
      'Quadratic Equations - Solution Methods',
      'Sets, Relations and Functions',
      'Permutations - Fundamental Principles',
      'Combinations - Selection and Applications',
      'Sequences and Series - AP, GP, HP',
      'Statistics - Measures of Central Tendency',
      'Statistics - Measures of Dispersion',
      'Probability - Basic Concepts and Theorems'
    ]
  },
  'Business Economics': {
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    lessons: [
      'Introduction to Microeconomics - Basic Concepts',
      'Theory of Demand - Law of Demand and Elasticity',
      'Theory of Supply - Law of Supply and Elasticity',
      'Market Equilibrium - Determination of Price',
      'Theory of Production and Cost',
      'Perfect Competition - Characteristics and Equilibrium',
      'Monopoly and Monopolistic Competition',
      'Oligopoly and Price Discrimination',
      'Indian Economy - Overview and Sectors',
      'Government Budget and Fiscal Policy'
    ]
  }
};

let totalGenerated = 0;
let totalFailed = 0;
const allLessons = {};

/**
 * Generate a single lesson with full AI content
 */
async function generateLesson(subject, lessonTitle, lessonNumber, totalLessons) {
  try {
    const config = CA_FOUNDATION[subject];
    
    console.log(`\n[${lessonNumber}/${totalLessons}] 📝 Generating: ${lessonTitle}`);
    console.log(`   Subject: ${subject}`);

    // Step 1: Create/Get Course
    const courseRes = await axios.post(`${API_BASE}/courses/generate`, {
      subject: subject,
      level: config.level,
      examType: config.examType,
      courseTitle: `CA Foundation - ${subject}`,
      modules: [{
        title: lessonTitle,
        description: `Complete lesson on ${lessonTitle}`,
        topics: [lessonTitle]
      }]
    }, { timeout: 30000 });

    const courseId = courseRes.data.data._id;
    console.log(`   ✅ Course: ${courseId.substring(0, 8)}...`);

    // Step 2: Generate Full Lesson Content
    console.log(`   🤖 Generating AI content...`);
    const lessonRes = await axios.post(
      `${API_BASE}/courses/${courseId}/generate-lesson`, 
      {
        moduleNumber: 1,
        chapterNumber: 1,
        topic: lessonTitle
      }, 
      { timeout: 180000 } // 3 minutes for AI generation
    );

    const lesson = lessonRes.data.data;
    
    // Display generation stats
    console.log(`   ✅ Lesson generated!`);
    console.log(`      📄 Introduction: ${lesson.introduction?.length || 0} chars`);
    console.log(`      💡 Key Concepts: ${lesson.keyConcepts?.length || 0}`);
    console.log(`      📚 Examples: ${lesson.practicalExamples?.length || 0}`);
    console.log(`      ❓ Questions: ${lesson.practiceQuestions?.length || 0}`);
    console.log(`      🎯 Exam Tips: ${lesson.examTips?.length || 0}`);
    console.log(`      📝 Summary: ${lesson.summary?.length || 0} chars`);

    return {
      success: true,
      lesson,
      subject,
      lessonTitle,
      lessonNumber
    };

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    if (error.response) {
      console.error(`      Status: ${error.response.status}`);
      console.error(`      Error: ${error.response.data?.message || 'Unknown error'}`);
    }
    
    return {
      success: false,
      subject,
      lessonTitle,
      lessonNumber,
      error: error.message
    };
  }
}

/**
 * Generate all lessons for a subject
 */
async function generateSubject(subject, config) {
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`📚 SUBJECT: CA Foundation - ${subject}`);
  console.log(`   Lessons: ${config.lessons.length}`);
  console.log(`${'═'.repeat(70)}`);

  const subjectLessons = [];
  let subjectGenerated = 0;
  let subjectFailed = 0;

  for (let i = 0; i < config.lessons.length; i++) {
    const lessonTitle = config.lessons[i];
    const result = await generateLesson(
      subject, 
      lessonTitle, 
      i + 1, 
      config.lessons.length
    );

    if (result.success) {
      subjectLessons.push(result.lesson);
      subjectGenerated++;
      totalGenerated++;
    } else {
      subjectFailed++;
      totalFailed++;
    }

    // Small delay between lessons
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📊 ${subject} Complete:`);
  console.log(`   ✅ Generated: ${subjectGenerated}`);
  console.log(`   ❌ Failed: ${subjectFailed}`);
  console.log(`${'─'.repeat(70)}`);

  return subjectLessons;
}

/**
 * Save lessons to files
 */
async function saveLessons(subject, lessons) {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const fileName = `ca-f-${subject.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    await fs.writeFile(filePath, JSON.stringify(lessons, null, 2), 'utf8');

    const fileSize = (JSON.stringify(lessons).length / 1024).toFixed(2);
    console.log(`\n💾 Saved: ${fileName} (${fileSize} KB)`);

    return { fileName, fileSize };

  } catch (error) {
    console.error(`❌ Error saving ${subject}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🎓 GENERATE COMPLETE CA FOUNDATION COURSE                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n📦 Output Directory:', OUTPUT_DIR);
  console.log('🎯 Total Lessons: 44 (4 subjects)');
  console.log('⏱️  Estimated Time: 60-90 minutes');
  console.log('\n' + '─'.repeat(70) + '\n');

  const startTime = Date.now();
  const savedFiles = [];

  try {
    // Generate each subject
    for (const [subject, config] of Object.entries(CA_FOUNDATION)) {
      const lessons = await generateSubject(subject, config);
      allLessons[subject] = lessons;
      
      // Save to file
      const fileInfo = await saveLessons(subject, lessons);
      savedFiles.push({ subject, ...fileInfo });
    }

    // Create manifest
    console.log('\n\n📋 Creating manifest...');
    const manifest = {
      version: '1.0',
      course: 'CA Foundation',
      generatedAt: new Date().toISOString(),
      totalLessons: totalGenerated,
      failed: totalFailed,
      subjects: Object.keys(CA_FOUNDATION).reduce((acc, subject) => {
        acc[subject] = {
          lessonsCount: allLessons[subject]?.length || 0,
          lessons: allLessons[subject]?.map((l, i) => ({
            lessonNumber: i + 1,
            topic: l.topic,
            hasIntroduction: !!l.introduction,
            conceptsCount: l.keyConcepts?.length || 0,
            examplesCount: l.practicalExamples?.length || 0,
            questionsCount: l.practiceQuestions?.length || 0
          })) || []
        };
        return acc;
      }, {}),
      files: savedFiles
    };

    const manifestPath = path.join(OUTPUT_DIR, 'ca-foundation-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('✅ Manifest created!');

    // Final summary
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    const totalSize = savedFiles.reduce((sum, f) => sum + parseFloat(f.fileSize), 0).toFixed(2);

    console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 CA FOUNDATION GENERATION COMPLETE!                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Statistics:`);
    console.log(`   ✅ Generated: ${totalGenerated} lessons`);
    console.log(`   ❌ Failed: ${totalFailed} lessons`);
    console.log(`   ⏱️  Duration: ${duration} minutes`);
    console.log(`   💾 Total Size: ${totalSize} KB`);
    console.log(`\n📁 Files Created:`);
    savedFiles.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.fileName} (${f.fileSize} KB)`);
    });
    console.log(`   ${savedFiles.length + 1}. ca-foundation-manifest.json`);
    console.log(`\n📂 Location: ${OUTPUT_DIR}`);
    console.log(`\n📤 Next Steps:`);
    console.log(`   1. Upload files to Google Drive`);
    console.log(`   2. Make files publicly accessible`);
    console.log(`   3. Update setup script with file IDs`);
    console.log(`   4. Run: npm run setup:drive-system`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();
