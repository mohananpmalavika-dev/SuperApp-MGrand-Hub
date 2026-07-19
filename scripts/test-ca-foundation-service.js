/* eslint-disable no-console */
process.env.USE_LOCAL_CONTENT = 'true';
process.env.LOCAL_CONTENT_PATH = './content/ca-foundation';

const path = require('path');

process.chdir(path.resolve(__dirname, '../services/education-service'));
const driveService = require('../services/education-service/src/services/googleDriveService');

async function run() {
  const catalog = await driveService.getCACourses();
  if (catalog.courses.length !== 4) {
    throw new Error(`Expected 4 courses, found ${catalog.courses.length}`);
  }

  const quantitative = await driveService.getCourseById('ca-f-quantitative-aptitude');
  if (quantitative.totalLessons !== 18 || quantitative.modules.length !== 3) {
    throw new Error('Quantitative Aptitude course structure is invalid');
  }

  const aliasCourse = await driveService.getCourseById('ca-f-business-mathematics');
  if (aliasCourse.id !== 'ca-f-quantitative-aptitude') {
    throw new Error('Legacy course alias is not working');
  }

  const first = await driveService.getLesson('ca-f-accounting', 0);
  const last = await driveService.getLesson('ca-f-accounting', 10);
  if (first.navigation.hasPrevious || !first.navigation.hasNext) {
    throw new Error('First-lesson navigation is invalid');
  }
  if (!last.navigation.hasPrevious || last.navigation.hasNext) {
    throw new Error('Last-lesson navigation is invalid');
  }

  console.log('CA Foundation service integration passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
