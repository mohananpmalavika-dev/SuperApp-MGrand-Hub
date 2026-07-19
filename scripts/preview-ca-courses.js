/**
 * Preview CA Foundation Courses Without MongoDB
 * Shows what will be imported
 */

const fs = require('fs');
const path = require('path');

console.log('📚 CA FOUNDATION COURSES PREVIEW\n');
console.log('='.repeat(60));

const courseFiles = [
  { file: 'ca-f-accounting.json', title: 'CA Foundation - Accounting' },
  { file: 'ca-f-business-economics.json', title: 'CA Foundation - Business Economics' },
  { file: 'ca-f-business-laws.json', title: 'CA Foundation - Business Laws' },
  { file: 'ca-f-business-mathematics.json', title: 'CA Foundation - Business Mathematics' }
];

let totalLessons = 0;
const allCourses = [];

courseFiles.forEach(({ file, title }, index) => {
  const filePath = path.join(__dirname, 'google-drive-content', file);
  
  console.log(`\n${index + 1}. ${title}`);
  console.log('-'.repeat(60));
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ File not found:', file);
    return;
  }
  
  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`   ✅ Lessons: ${lessons.length}`);
  console.log(`   📁 File: ${file}`);
  console.log(`   📊 Size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
  
  // Show first 3 lesson topics
  console.log(`\n   📖 Sample Lessons:`);
  lessons.slice(0, 3).forEach((lesson, i) => {
    console.log(`      ${i + 1}. ${lesson.topic} (${lesson.duration} min)`);
  });
  
  if (lessons.length > 3) {
    console.log(`      ... and ${lessons.length - 3} more lessons`);
  }
  
  totalLessons += lessons.length;
  
  allCourses.push({
    title,
    file,
    lessonCount: lessons.length,
    lessons: lessons.map(l => ({
      topic: l.topic,
      duration: l.duration,
      hasVideo: !!l.videoUrl,
      hasAudio: !!l.audioUrl,
      conceptCount: l.keyConcepts?.length || 0,
      exampleCount: l.solvedExamples?.length || 0
    }))
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Total Courses: ${courseFiles.length}`);
console.log(`✅ Total Lessons: ${totalLessons}`);
console.log(`✅ Ready to import into education module`);

// Save summary
const summary = {
  generated: new Date().toISOString(),
  totalCourses: courseFiles.length,
  totalLessons,
  courses: allCourses
};

fs.writeFileSync(
  path.join(__dirname, 'ca-courses-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`\n💾 Summary saved to: ca-courses-summary.json`);

console.log('\n' + '='.repeat(60));
console.log('🎯 NEXT STEPS');
console.log('='.repeat(60));
console.log(`
1. Fix MongoDB connection issue (see MONGODB_CONNECTION_ISSUE.md)
2. Then run: node setup-ca-tutorials-in-education-module.js
3. Your courses will be imported to the education module

Alternative: You can also manually import these JSON files
via MongoDB Compass when the connection is working.
`);

console.log('✅ Preview complete!\n');
