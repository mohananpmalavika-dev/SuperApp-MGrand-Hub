const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate ALL 122 Lessons for Google Drive Storage
 * 
 * This script generates complete content for all tracks and saves
 * it in an organized folder structure ready for Google Drive upload.
 */

const API_BASE = 'http://localhost:3013/api/education';
const OUTPUT_DIR = path.join(__dirname, 'google-drive-content');

// Track Definitions (122 total lessons)
const TRACKS = {
  'CA-Foundation': {
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    courses: [
      {
        subject: 'Accounting',
        topics: [
          'Introduction to Accounting', 'Journal Entries', 'Ledger Posting',
          'Cash Book', 'Purchase Book', 'Sales Book',
          'Trading Account', 'Profit & Loss Account', 'Balance Sheet',
          'Trial Balance', 'Error Rectification', 'Bank Reconciliation'
        ]
      },
      {
        subject: 'Business Laws',
        topics: [
          'Indian Contract Act Basics', 'Offer and Acceptance', 'Consideration',
          'Capacity to Contract', 'Free Consent', 'Valid Contracts',
          'Sale of Goods Act', 'Indian Partnership Act', 'LLP Basics',
          'Companies Act Basics'
        ]
      },
      {
        subject: 'Business Mathematics',
        topics: [
          'Ratio and Proportion', 'Indices', 'Logarithms',
          'Linear Equations', 'Quadratic Equations', 'Sets and Relations',
          'Permutations', 'Combinations', 'Sequences and Series',
          'Statistics Basics', 'Probability', 'Logical Reasoning'
        ]
      },
      {
        subject: 'Business Economics',
        topics: [
          'Introduction to Microeconomics', 'Demand and Supply', 'Equilibrium',
          'Production Theory', 'Cost Analysis', 'Perfect Competition',
          'Monopoly', 'Monopolistic Competition', 'Government Policies', 'Business Organization'
        ]
      }
    ]
  },
  'JEE-Physics': {
    examType: 'JEE_MAIN',
    level: 'ADVANCED',
    courses: [
      {
        subject: 'Physics',
        topics: [
          'Kinematics - Motion in One Dimension', 'Motion in Two Dimensions', 'Laws of Motion',
          'Work Energy and Power', 'Circular Motion', 'Center of Mass',
          'Rotational Motion', 'Gravitation', 'Simple Harmonic Motion',
          'Elasticity', 'Fluid Mechanics', 'Surface Tension',
          'Thermodynamics First Law', 'Thermodynamics Second Law', 'Kinetic Theory of Gases',
          'Wave Motion', 'Sound Waves', 'Electrostatics',
          'Capacitance', 'Current Electricity', 'Magnetic Effects of Current',
          'Magnetism', 'Electromagnetic Induction', 'AC Circuits',
          'Electromagnetic Waves', 'Ray Optics', 'Wave Optics',
          'Dual Nature of Matter', 'Atomic Physics', 'Nuclear Physics'
        ]
      }
    ]
  },
  'CBSE-Class-10': {
    examType: 'CBSE_CLASS_10',
    level: 'INTERMEDIATE',
    courses: [
      {
        subject: 'Mathematics',
        topics: [
          'Real Numbers', 'Polynomials', 'Linear Equations in Two Variables',
          'Quadratic Equations', 'Arithmetic Progressions', 'Triangles',
          'Coordinate Geometry', 'Introduction to Trigonometry', 'Trigonometric Identities',
          'Heights and Distances', 'Circles', 'Constructions',
          'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics',
          'Probability'
        ]
      }
    ]
  },
  'IAS-Prelims': {
    examType: 'IAS_PRELIMS',
    level: 'ADVANCED',
    courses: [
      {
        subject: 'Polity',
        topics: [
          'Indian Constitution Basics', 'Fundamental Rights', 'Directive Principles',
          'Union Government', 'State Government', 'Panchayati Raj',
          'Judiciary System', 'Constitutional Amendments', 'Emergency Provisions'
        ]
      },
      {
        subject: 'History',
        topics: [
          'Ancient India - Indus Valley', 'Vedic Period', 'Mauryan Empire',
          'Gupta Period', 'Medieval India - Delhi Sultanate', 'Mughal Empire',
          'Modern India - British Rule', 'Freedom Struggle', 'Independence Movement'
        ]
      },
      {
        subject: 'Geography',
        topics: [
          'Physical Geography', 'Climate of India', 'Drainage System',
          'Natural Resources', 'Agriculture', 'Industries'
        ]
      },
      {
        subject: 'Economics',
        topics: [
          'Indian Economy Overview', 'Economic Planning', 'Agriculture Economy',
          'Industrial Development', 'Banking System', 'Budget and Fiscal Policy',
          'International Trade', 'Economic Reforms', 'Current Economic Issues'
        ]
      },
      {
        subject: 'Science & Technology',
        topics: [
          'Basic Science Concepts', 'Technology in India', 'Space Technology'
        ]
      }
    ]
  }
};

let totalGenerated = 0;
let totalFailed = 0;
const allResults = [];

/**
 * Generate a course and its lessons
 */
async function generateTrackContent(trackName, trackConfig) {
  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`📚 TRACK: ${trackName}`);
  console.log(`${'='.repeat(70)}\n`);

  const trackDir = path.join(OUTPUT_DIR, trackName);
  await fs.mkdir(trackDir, { recursive: true });

  for (const course of trackConfig.courses) {
    console.log(`\n📖 Subject: ${course.subject}`);
    console.log(`   Topics: ${course.topics.length}`);
    console.log('─'.repeat(70));

    for (let i = 0; i < course.topics.length; i++) {
      const topic = course.topics[i];
      const lessonNumber = i + 1;

      try {
        console.log(`\n[${lessonNumber}/${course.topics.length}] Generating: ${topic}...`);

        // Step 1: Create/Get Course
        const courseRes = await axios.post(`${API_BASE}/courses/generate`, {
          subject: course.subject,
          level: trackConfig.level,
          examType: trackConfig.examType,
          courseTitle: `${trackName} - ${course.subject}`,
          modules: [{
            title: topic,
            description: `Complete lesson on ${topic}`,
            topics: [topic]
          }]
        }, { timeout: 30000 });

        const courseId = courseRes.data.data._id;
        console.log(`   ✅ Course created/reused: ${courseId}`);

        // Step 2: Generate Lesson Content
        const lessonRes = await axios.post(`${API_BASE}/courses/${courseId}/generate-lesson`, {
          moduleNumber: 1,
          chapterNumber: 1,
          topic: topic
        }, { timeout: 120000 }); // 2 min timeout for AI generation

        const lesson = lessonRes.data.data;
        console.log(`   ✅ Lesson generated!`);
        console.log(`      - Introduction: ${lesson.introduction?.length || 0} chars`);
        console.log(`      - Key Concepts: ${lesson.keyConcepts?.length || 0}`);
        console.log(`      - Examples: ${lesson.practicalExamples?.length || 0}`);
        console.log(`      - Questions: ${lesson.practiceQuestions?.length || 0}`);

        // Step 3: Save to file
        const fileName = `lesson-${String(lessonNumber).padStart(3, '0')}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
        const filePath = path.join(trackDir, fileName);

        await fs.writeFile(filePath, JSON.stringify(lesson, null, 2), 'utf8');
        console.log(`   💾 Saved: ${fileName}`);

        allResults.push({
          success: true,
          trackName,
          subject: course.subject,
          topic,
          lessonNumber,
          fileName,
          lesson
        });

        totalGenerated++;

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        allResults.push({
          success: false,
          trackName,
          subject: course.subject,
          topic,
          lessonNumber,
          error: error.message
        });
        totalFailed++;
      }
    }
  }
}

/**
 * Create manifest file
 */
async function createManifest() {
  console.log('\n\n📋 Creating manifest.json...');

  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalLessons: allResults.length,
    successful: totalGenerated,
    failed: totalFailed,
    tracks: {}
  };

  // Group by track
  for (const result of allResults.filter(r => r.success)) {
    if (!manifest.tracks[result.trackName]) {
      manifest.tracks[result.trackName] = [];
    }
    manifest.tracks[result.trackName].push({
      lessonNumber: result.lessonNumber,
      subject: result.subject,
      topic: result.topic,
      fileName: result.fileName,
      hasIntroduction: !!result.lesson.introduction,
      conceptsCount: result.lesson.keyConcepts?.length || 0,
      examplesCount: result.lesson.practicalExamples?.length || 0,
      questionsCount: result.lesson.practiceQuestions?.length || 0
    });
  }

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ Manifest created!');

  // Create README
  const readme = `# Personal AI Tutor - Generated Content

Generated: ${new Date().toISOString()}

## Summary

- **Total Lessons:** ${allResults.length}
- **Successful:** ${totalGenerated}
- **Failed:** ${totalFailed}

## Tracks

${Object.entries(manifest.tracks).map(([track, lessons]) => `
### ${track} (${lessons.length} lessons)
${lessons.slice(0, 5).map(l => `- ${l.topic}`).join('\n')}
${lessons.length > 5 ? `... and ${lessons.length - 5} more` : ''}
`).join('\n')}

## Upload to Google Drive

1. Open: https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw
2. Drag & drop this entire folder
3. Wait for upload to complete

## File Structure

Each lesson JSON contains:
- Introduction
- Key Concepts with definitions
- Practical Examples
- Practice Questions
- Exam Tips
- Summary
`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf8');
  console.log('✅ README created!');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 GENERATING ALL 122 LESSONS FOR GOOGLE DRIVE                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\nOutput Directory:', OUTPUT_DIR);
  console.log('Estimated Time: 3-4 hours');
  console.log('\nStarting generation...\n');

  const startTime = Date.now();

  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Generate content for each track
    for (const [trackName, trackConfig] of Object.entries(TRACKS)) {
      await generateTrackContent(trackName, trackConfig);
    }

    // Create manifest and README
    await createManifest();

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

    console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 GENERATION COMPLETE!                                          ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Generated: ${totalGenerated} lessons`);
    console.log(`❌ Failed: ${totalFailed} lessons`);
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log('\n📤 NEXT STEPS:');
    console.log('1. Run: npm run upload:drive');
    console.log('2. Drag & drop folder to Google Drive');
    console.log('3. Wait for upload (~30-60 min)');
    console.log('4. Done! 🎉\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run
main();
