const fs = require('fs');
const path = require('path');

require('../services/education-service/node_modules/dotenv').config({
  path: path.join(__dirname, '../services/education-service/.env'),
});

const contentGenerator = require('../services/education-service/src/ai/content-generator');
const { courses: caCourses } = require('./generate-ca-foundation');
const { course: jeeCourse } = require('./generate-jee-physics');
const { course: cbseCourse } = require('./generate-cbse-10');
const { course: iasCourse } = require('./generate-ias-prelims');

const outputDirectory = path.join(__dirname, 'generated-courses');

const courseDefinitions = [
  ...caCourses.map((course) => ({
    ...course,
    examType: 'CA_FOUNDATION',
    level: 'FOUNDATION',
    subject: course.name.replace('CA Foundation - ', ''),
  })),
  {
    ...jeeCourse,
    examType: 'JEE_MAIN',
    level: 'INTERMEDIATE',
    subject: 'Physics',
  },
  {
    ...cbseCourse,
    examType: 'CBSE_CLASS_10',
    level: 'FOUNDATION',
    subject: 'Mathematics',
  },
  {
    ...iasCourse,
    examType: 'IAS_PRELIMS',
    level: 'ADVANCED',
    subject: 'General Studies',
  },
];

function courseFileName(course) {
  return `${course.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
}

function loadCourseFile(filePath, course) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    course: {
      code: course.code,
      name: course.name,
      subject: course.subject,
      examType: course.examType,
      level: course.level,
      lessonCount: course.modules.length,
    },
    lessons: [],
  };
}

function saveCourseFile(filePath, document) {
  document.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
}

async function generateCourse(course) {
  const filePath = path.join(outputDirectory, courseFileName(course));
  const document = loadCourseFile(filePath, course);
  const completed = new Set(document.lessons.map((lesson) => lesson.moduleNumber));

  console.log(`\n${course.name} (${completed.size}/${course.modules.length} complete)`);

  for (let index = 0; index < course.modules.length; index++) {
    const moduleNumber = index + 1;
    if (completed.has(moduleNumber)) {
      console.log(`  [${moduleNumber}/${course.modules.length}] Reusing ${course.modules[index].title}`);
      continue;
    }

    const module = course.modules[index];
    const topic = `${module.title}: ${module.topics.join(', ')}`;
    console.log(`  [${moduleNumber}/${course.modules.length}] Generating ${module.title}`);

    const content = await contentGenerator.generateLessonContent(
      topic,
      course.subject,
      course.level,
      course.examType
    );

    document.lessons.push({
      moduleNumber,
      title: module.title,
      topics: module.topics,
      content,
      generatedAt: new Date().toISOString(),
    });
    document.lessons.sort((left, right) => left.moduleNumber - right.moduleNumber);
    saveCourseFile(filePath, document);
  }

  return {
    code: course.code,
    name: course.name,
    file: path.basename(filePath),
    lessons: document.lessons.length,
  };
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const summary = {
    generatedAt: new Date().toISOString(),
    storage: 'Google Drive JSON export (MongoDB is not used)',
    courses: [],
  };

  for (const course of courseDefinitions) {
    try {
      summary.courses.push(await generateCourse(course));
    } catch (error) {
      console.error(`  Failed ${course.name}: ${error.message}`);
      summary.courses.push({
        code: course.code,
        name: course.name,
        error: error.message,
      });
    }
    fs.writeFileSync(
      path.join(outputDirectory, 'manifest.json'),
      JSON.stringify(summary, null, 2)
    );
  }

  const failures = summary.courses.filter((course) => course.error);
  if (failures.length) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { courseDefinitions, main };
