/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const directory = path.resolve(
  __dirname,
  '../services/education-service/content/ca-foundation'
);
const catalog = JSON.parse(
  fs.readFileSync(path.join(directory, 'ca-foundation-catalog.json'), 'utf8')
);

const issues = [];
let totalLessons = 0;

for (const course of catalog.courses) {
  const filePath = path.join(directory, course.localFile);
  if (!fs.existsSync(filePath)) {
    issues.push(`${course.id}: missing ${course.localFile}`);
    continue;
  }

  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  totalLessons += lessons.length;

  if (lessons.length !== course.totalLessons) {
    issues.push(`${course.id}: catalog says ${course.totalLessons}, file has ${lessons.length}`);
  }

  lessons.forEach((lesson, index) => {
    const requiredText = ['topic', 'introduction', 'detailedContent'];
    requiredText.forEach((field) => {
      if (!lesson[field] || typeof lesson[field] !== 'string') {
        issues.push(`${course.id}[${index}]: missing ${field}`);
      }
    });

    if (lesson.lessonIndex !== index) {
      issues.push(`${course.id}[${index}]: lessonIndex mismatch`);
    }
    if (!lesson.keyConcepts?.length) {
      issues.push(`${course.id}[${index}]: no key concepts`);
    }
    if (!lesson.practiceProblems?.length) {
      issues.push(`${course.id}[${index}]: no practice`);
    }
    if (!lesson.audio?.narrationScript || !lesson.audio?.sections?.length) {
      issues.push(`${course.id}[${index}]: incomplete audio lesson`);
    }
    if (!lesson.video?.slides?.length) {
      issues.push(`${course.id}[${index}]: incomplete guided visual lesson`);
    }
    if (lesson.source?.applicableFrom !== 'May 2026 examination onward') {
      issues.push(`${course.id}[${index}]: wrong syllabus applicability`);
    }
  });
}

if (catalog.courses.length !== 4) {
  issues.push(`Expected 4 papers, found ${catalog.courses.length}`);
}
if (totalLessons !== 46) {
  issues.push(`Expected 46 chapter lessons, found ${totalLessons}`);
}

if (issues.length) {
  console.error(`CA Foundation validation failed with ${issues.length} issue(s):`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(
  `CA Foundation content is valid: ${catalog.courses.length} papers, ${totalLessons} lessons, ` +
    'with text, audio, guided visual classes and practice.'
);
