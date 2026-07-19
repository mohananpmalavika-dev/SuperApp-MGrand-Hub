const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Content Generation for Google Drive Storage
 * 
 * This script generates ALL content in an organized folder structure
 * ready to be uploaded to Google Drive.
 * 
 * Folder Structure:
 * google-drive-content/
 *   ├── CA-Foundation/
 *   │   ├── lesson-001-accounting-basics.json
 *   │   ├── lesson-001-audio.txt (TTS script)
 *   │   └── ...
 *   ├── JEE-Physics/
 *   ├── CBSE-Class-10/
 *   ├── IAS-Prelims/
 *   └── manifest.json (complete index)
 */

const API_BASE = 'http://localhost:3013/api/education';
const OUTPUT_DIR = path.join(__dirname, 'google-drive-content');

// Content Configuration
const CONTENT_TRACKS = {
  'CA-Foundation': {
    endpoint: '/courses/generate',
    lessons: [
      { title: 'Introduction to Accounting', subject: 'Accounting', level: 'Foundation' },
      { title: 'Journal Entries Fundamentals', subject: 'Accounting', level: 'Foundation' },
      { title: 'Ledger and Trial Balance', subject: 'Accounting', level: 'Foundation' },
      // ... 37 more lessons
    ]
  },
  'JEE-Physics': {
    endpoint: '/courses/generate',
    lessons: [
      { title: 'Kinematics - Motion in One Dimension', subject: 'Physics', level: 'JEE Main' },
      { title: 'Laws of Motion', subject: 'Physics', level: 'JEE Main' },
      // ... 28 more lessons
    ]
  },
  'CBSE-Class-10': {
    endpoint: '/courses/generate',
    lessons: [
      { title: 'Real Numbers', subject: 'Mathematics', level: 'Class 10' },
      { title: 'Polynomials', subject: 'Mathematics', level: 'Class 10' },
      // ... 14 more lessons
    ]
  },
  'IAS-Prelims': {
    endpoint: '/courses/generate',
    lessons: [
      { title: 'Indian Polity - Constitution Basics', subject: 'Polity', level: 'IAS Prelims' },
      { title: 'Indian History - Ancient India', subject: 'History', level: 'IAS Prelims' },
      // ... 34 more lessons
    ]
  }
};

/**
 * Generate a single lesson with all content
 */
async function generateLesson(trackName, lessonData, index) {
  try {
    console.log(`\n📝 Generating: ${trackName} - ${lessonData.title}`);
    
    // Call education service to generate content
    const response = await axios.post(`${API_BASE}/courses/generate`, {
      title: lessonData.title,
      description: `Complete ${lessonData.level} lesson on ${lessonData.title}`,
      subject: lessonData.subject,
      level: lessonData.level,
      duration: '15-20 minutes',
      includeAudio: true,
      includeVideo: true,
      includeAnimations: true,
      includeQuestions: true
    }, {
      timeout: 300000 // 5 minutes timeout per lesson
    });

    if (response.data && response.data.success) {
      const lesson = response.data.data;
      
      // Save lesson data as JSON
      const trackDir = path.join(OUTPUT_DIR, trackName);
      await fs.mkdir(trackDir, { recursive: true });
      
      const lessonFileName = `lesson-${String(index + 1).padStart(3, '0')}-${lessonData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
      const lessonPath = path.join(trackDir, lessonFileName);
      
      await fs.writeFile(lessonPath, JSON.stringify(lesson, null, 2), 'utf8');
      
      console.log(`✅ Generated: ${lessonFileName}`);
      console.log(`   - Content: ${lesson.content?.length || 0} characters`);
      console.log(`   - Audio: ${lesson.audioUrl ? 'Yes' : 'No'}`);
      console.log(`   - Video: ${lesson.videoUrl ? 'Yes' : 'No'}`);
      console.log(`   - Animations: ${lesson.animations?.length || 0}`);
      console.log(`   - Questions: ${lesson.questions?.length || 0}`);
      
      return {
        success: true,
        lesson,
        filePath: lessonPath,
        trackName,
        index
      };
    } else {
      throw new Error('Generation failed: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error(`❌ Error generating ${lessonData.title}:`, error.message);
    return {
      success: false,
      error: error.message,
      lessonData,
      trackName,
      index
    };
  }
}

/**
 * Generate all content for all tracks
 */
async function generateAllContent() {
  console.log('🚀 Starting Content Generation for Google Drive\n');
  console.log('=====================================');
  console.log('Output Directory:', OUTPUT_DIR);
  console.log('=====================================\n');

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const allResults = [];
  let totalGenerated = 0;
  let totalFailed = 0;

  // Generate content for each track
  for (const [trackName, trackConfig] of Object.entries(CONTENT_TRACKS)) {
    console.log(`\n\n📚 Track: ${trackName}`);
    console.log(`   Lessons to generate: ${trackConfig.lessons.length}`);
    console.log('─────────────────────────────────────\n');

    for (let i = 0; i < trackConfig.lessons.length; i++) {
      const result = await generateLesson(trackName, trackConfig.lessons[i], i);
      allResults.push(result);

      if (result.success) {
        totalGenerated++;
      } else {
        totalFailed++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Create manifest
  console.log('\n\n📋 Creating manifest file...');
  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalLessons: allResults.length,
    successfulLessons: totalGenerated,
    failedLessons: totalFailed,
    tracks: Object.keys(CONTENT_TRACKS).reduce((acc, trackName) => {
      acc[trackName] = allResults
        .filter(r => r.trackName === trackName && r.success)
        .map(r => ({
          title: r.lesson.title,
          subject: r.lesson.subject,
          level: r.lesson.level,
          file: path.basename(r.filePath),
          contentSize: r.lesson.content?.length || 0,
          hasAudio: !!r.lesson.audioUrl,
          hasVideo: !!r.lesson.videoUrl,
          animationsCount: r.lesson.animations?.length || 0,
          questionsCount: r.lesson.questions?.length || 0
        }));
      return acc;
    }, {}),
    statistics: {
      totalContentSize: allResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.lesson?.content?.length || 0), 0),
      totalLessonsWithAudio: allResults
        .filter(r => r.success && r.lesson?.audioUrl).length,
      totalLessonsWithVideo: allResults
        .filter(r => r.success && r.lesson?.videoUrl).length,
      totalAnimations: allResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.lesson?.animations?.length || 0), 0),
      totalQuestions: allResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.lesson?.questions?.length || 0), 0)
    },
    failures: allResults
      .filter(r => !r.success)
      .map(r => ({
        trackName: r.trackName,
        lessonTitle: r.lessonData?.title,
        error: r.error
      }))
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  // Create README for Google Drive
  const readme = `# Personal AI Tutor - Generated Content

## 📊 Generation Summary

- **Generated:** ${new Date(manifest.generatedAt).toLocaleString()}
- **Total Lessons:** ${manifest.totalLessons}
- **Successful:** ${manifest.successfulLessons}
- **Failed:** ${manifest.failedLessons}

## 📚 Content Tracks

${Object.entries(manifest.tracks).map(([track, lessons]) => `
### ${track} (${lessons.length} lessons)
${lessons.slice(0, 5).map(l => `- ${l.title}`).join('\n')}
${lessons.length > 5 ? `... and ${lessons.length - 5} more` : ''}
`).join('\n')}

## 📈 Statistics

- **Total Content:** ${(manifest.statistics.totalContentSize / 1024 / 1024).toFixed(2)} MB
- **Lessons with Audio:** ${manifest.statistics.totalLessonsWithAudio}
- **Lessons with Video:** ${manifest.statistics.totalLessonsWithVideo}
- **Total Animations:** ${manifest.statistics.totalAnimations}
- **Total Questions:** ${manifest.statistics.totalQuestions}

## 🔗 How to Use

1. Upload this entire folder to your Google Drive
2. Share the folder link with your application
3. Use the manifest.json to index and access all content

## 📁 Folder Structure

\`\`\`
google-drive-content/
├── CA-Foundation/
│   ├── lesson-001-*.json
│   └── ...
├── JEE-Physics/
├── CBSE-Class-10/
├── IAS-Prelims/
├── manifest.json
└── README.md
\`\`\`
`;

  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  await fs.writeFile(readmePath, readme, 'utf8');

  console.log('✅ Manifest created!');
  console.log('\n\n═══════════════════════════════════════');
  console.log('🎉 GENERATION COMPLETE!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Generated: ${totalGenerated} lessons`);
  console.log(`❌ Failed: ${totalFailed} lessons`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('\n📤 NEXT STEPS:');
  console.log('1. Open File Explorer: ' + OUTPUT_DIR);
  console.log('2. Open your Google Drive folder: https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw');
  console.log('3. Drag & drop the "google-drive-content" folder to Google Drive');
  console.log('4. Wait for upload to complete (~18 GB)');
  console.log('5. Share the Google Drive folder URL with your application');
  console.log('═══════════════════════════════════════\n');
}

// Run generation
generateAllContent()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
