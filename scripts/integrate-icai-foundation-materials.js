/**
 * ICAI CA Foundation Materials Integration Script
 * Integrates official ICAI CA Foundation course materials into the education platform
 * 
 * Features:
 * - Imports from individual lesson JSON files in CA-Foundation folder
 * - Organizes by ICAI's official syllabus structure
 * - Creates courses for all 4 CA Foundation papers
 * - Supports multimedia content (PDFs, videos, audio)
 * - Better error handling and retry logic
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mgrand-hub';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

// Course Schema
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  examType: String,
  subject: String,
  level: String,
  duration: Number,
  totalLessons: Number,
  instructor: String,
  price: Number,
  currency: String,
  thumbnail: String,
  tags: [String],
  syllabus: String,
  examPattern: String,
  modules: [{
    moduleNumber: Number,
    title: String,
    description: String,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
  }],
  icaiApproved: { type: Boolean, default: true },
  lastUpdated: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  moduleNumber: Number,
  chapterNumber: Number,
  topic: String,
  subject: String,
  duration: Number,
  introduction: String,
  keyConcepts: [{
    concept: String,
    definition: String,
    explanation: String
  }],
  detailedContent: String,
  solvedExamples: [{
    question: String,
    solution: String,
    keyTakeaway: String
  }],
  practicalExamples: [{
    scenario: String,
    application: String,
    outcome: String
  }],
  realWorldApplications: [String],
  quickRevision: {
    summary: [String],
    formulas: [String],
    mnemonics: [String]
  },
  examTips: [String],
  commonMistakes: [{
    mistake: String,
    why: String,
    howToAvoid: String
  }],
  practiceProblems: [{
    question: String,
    difficulty: String,
    solution: String
  }],
  videoUrl: String,
  audioUrl: String,
  audioSegments: [String],
  notesUrl: String,
  resources: [{
    title: String,
    url: String,
    type: String
  }],
  viewCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
  icaiChapterRef: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

// ICAI CA Foundation Official Syllabus Structure
const ICAI_FOUNDATION_COURSES = [
  {
    code: 'PAPER-1',
    title: 'CA Foundation - Principles and Practice of Accounting',
    description: 'Comprehensive course covering theoretical framework, accounting process, bank reconciliation, depreciation, inventories, and financial statements preparation as per ICAI syllabus.',
    subject: 'Accounting',
    totalMarks: 100,
    duration: 3, // hours
    examPattern: 'Part A: 60 marks (Theory + Practical), Part B: 40 marks (Practical Problems)',
    syllabus: `
1. Theoretical Framework (12 Marks)
2. Accounting Process (20 Marks)
3. Bank Reconciliation Statement (8 Marks)
4. Inventories (10 Marks)
5. Depreciation (12 Marks)
6. Financial Statements of Sole Proprietorship (38 Marks)
    `,
    price: 5999,
    thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Paper+1+Accounting',
    tags: ['ICAI', 'CA Foundation', 'Paper 1', 'Accounting', 'Official Syllabus'],
    expectedLessons: 30
  },
  {
    code: 'PAPER-2',
    title: 'CA Foundation - Business Laws and Business Correspondence and Reporting',
    description: 'Complete coverage of Indian Contract Act, Sale of Goods Act, Indian Partnership Act, Limited Liability Partnership Act, and Business Correspondence as per ICAI syllabus.',
    subject: 'Business Laws',
    totalMarks: 100,
    duration: 3,
    examPattern: 'Part I: Business Laws (60 marks), Part II: Business Correspondence and Reporting (40 marks)',
    syllabus: `
PART I: BUSINESS LAWS (60 Marks)
1. Indian Contract Act, 1872
2. Sale of Goods Act, 1930
3. Indian Partnership Act, 1932
4. Limited Liability Partnership Act, 2008
5. Companies Act, 2013

PART II: BUSINESS CORRESPONDENCE AND REPORTING (40 Marks)
1. Communication
2. Business Correspondence
3. Report Writing
    `,
    price: 4999,
    thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Paper+2+Laws',
    tags: ['ICAI', 'CA Foundation', 'Paper 2', 'Business Laws', 'Official Syllabus'],
    expectedLessons: 25
  },
  {
    code: 'PAPER-3',
    title: 'CA Foundation - Business Mathematics and Logical Reasoning & Statistics',
    description: 'Thorough preparation for Business Mathematics, Logical Reasoning, and Statistics covering ratio & proportion, indices, equations, statistics, and probability as per ICAI syllabus.',
    subject: 'Business Mathematics',
    totalMarks: 100,
    duration: 3,
    examPattern: 'Part A: Business Mathematics & Logical Reasoning (40 marks), Part B: Statistics (60 marks)',
    syllabus: `
PART A: BUSINESS MATHEMATICS AND LOGICAL REASONING (40 Marks)
1. Ratio and Proportion, Indices, Logarithms
2. Equations and Matrices
3. Linear Inequalities
4. Time Value of Money
5. Permutations and Combinations
6. Sequence and Series
7. Sets, Relations and Functions
8. Basic concepts of Differential and Integral Calculus
9. Logical Reasoning

PART B: STATISTICS (60 Marks)
1. Statistical Description of Data
2. Measures of Central Tendency and Dispersion
3. Probability
4. Theoretical Distributions
5. Correlation and Regression
6. Index Numbers
7. Time Series Analysis
    `,
    price: 4999,
    thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Paper+3+Maths',
    tags: ['ICAI', 'CA Foundation', 'Paper 3', 'Mathematics', 'Statistics', 'Official Syllabus'],
    expectedLessons: 35
  },
  {
    code: 'PAPER-4',
    title: 'CA Foundation - Business Economics and Business and Commercial Knowledge',
    description: 'Complete Business Economics covering micro and macro economics, and Business & Commercial Knowledge including business environment, government policies, and current affairs as per ICAI syllabus.',
    subject: 'Business Economics',
    totalMarks: 100,
    duration: 3,
    examPattern: 'Part A: Business Economics (60 marks), Part B: Business and Commercial Knowledge (40 marks)',
    syllabus: `
PART A: BUSINESS ECONOMICS (60 Marks)
1. Introduction to Business Economics
2. Theory of Demand and Supply
3. Theory of Production and Cost
4. Price Determination in Different Markets
5. Business Cycles
6. National Income
7. Money Market and Banking
8. Public Finance

PART B: BUSINESS AND COMMERCIAL KNOWLEDGE (40 Marks)
1. Business Environment
2. Business Organizations
3. Government Policies for Business Growth
4. Governance and Ethics
5. Current Economic Affairs
    `,
    price: 4999,
    thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Paper+4+Economics',
    tags: ['ICAI', 'CA Foundation', 'Paper 4', 'Economics', 'BCK', 'Official Syllabus'],
    expectedLessons: 28
  }
];

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Connect to MongoDB with retry
async function connectWithRetry(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔌 Connecting to MongoDB... (Attempt ${i + 1}/${retries})`);
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB successfully!\n');
      return true;
    } catch (error) {
      console.log(`⚠️  Connection attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...\n`);
        await sleep(RETRY_DELAY);
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
}

// Load lessons from individual JSON files
function loadLessonsFromFolder(folderPath) {
  console.log(`📂 Loading lessons from: ${folderPath}`);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.json'))
    .sort(); // Sort to maintain order

  console.log(`   Found ${files.length} JSON files`);

  const lessons = [];
  for (const file of files) {
    try {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lessonData = JSON.parse(content);
      lessons.push({
        ...lessonData,
        sourceFile: file
      });
    } catch (error) {
      console.log(`   ⚠️  Error reading ${file}: ${error.message}`);
    }
  }

  return lessons;
}

// Load lessons from aggregated JSON files
function loadLessonsFromAggregatedFile(fileName) {
  const filePath = path.join(__dirname, 'google-drive-content', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lessons = JSON.parse(content);
    return Array.isArray(lessons) ? lessons : [lessons];
  } catch (error) {
    console.log(`⚠️  Error reading ${fileName}: ${error.message}`);
    return [];
  }
}

// Main integration function
async function integrateICAIMaterials() {
  try {
    // Connect to database
    await connectWithRetry();

    console.log('='.repeat(70));
    console.log('🎓 ICAI CA FOUNDATION MATERIALS INTEGRATION');
    console.log('='.repeat(70));
    console.log();

    let totalCoursesCreated = 0;
    let totalCoursesUpdated = 0;
    let totalLessonsCreated = 0;
    let totalLessonsUpdated = 0;

    // Process each ICAI course
    for (const courseConfig of ICAI_FOUNDATION_COURSES) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📚 Processing: ${courseConfig.title}`);
      console.log(`   Code: ${courseConfig.code}`);
      console.log(`${'─'.repeat(70)}`);

      // Try to load lessons from individual files first
      let lessons = loadLessonsFromFolder(
        path.join(__dirname, 'google-drive-content', 'CA-Foundation', courseConfig.code)
      );

      // If no individual files, try aggregated file
      if (lessons.length === 0) {
        console.log(`   ℹ️  No individual lesson files found, checking aggregated files...`);
        const aggregatedFileNames = [
          `ca-f-${courseConfig.subject.toLowerCase().replace(/\s+/g, '-')}.json`,
          `${courseConfig.code.toLowerCase()}.json`
        ];

        for (const fileName of aggregatedFileNames) {
          lessons = loadLessonsFromAggregatedFile(fileName);
          if (lessons.length > 0) {
            console.log(`   ✓ Loaded from ${fileName}`);
            break;
          }
        }
      }

      if (lessons.length === 0) {
        console.log(`   ⚠️  No lessons found for ${courseConfig.title}`);
        console.log(`   ⏭️  Skipping course creation...\n`);
        continue;
      }

      console.log(`   📖 Loaded ${lessons.length} lessons`);

      // Check if course exists
      let course = await Course.findOne({
        examType: 'CA_FOUNDATION',
        subject: courseConfig.subject,
        title: courseConfig.title
      });

      const courseData = {
        title: courseConfig.title,
        description: courseConfig.description,
        category: 'Professional',
        examType: 'CA_FOUNDATION',
        subject: courseConfig.subject,
        level: 'Foundation',
        totalLessons: lessons.length,
        duration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
        instructor: 'ICAI Approved Faculty',
        price: courseConfig.price,
        currency: 'INR',
        thumbnail: courseConfig.thumbnail,
        tags: courseConfig.tags,
        syllabus: courseConfig.syllabus,
        examPattern: courseConfig.examPattern,
        icaiApproved: true,
        lastUpdated: new Date(),
        modules: []
      };

      if (course) {
        console.log(`   ℹ️  Course exists (ID: ${course._id})`);
        console.log(`   🔄 Updating course metadata...`);
        Object.assign(course, courseData);
        course.updatedAt = new Date();
        await course.save();
        totalCoursesUpdated++;
        console.log(`   ✅ Course updated`);
      } else {
        console.log(`   ✨ Creating new course...`);
        course = new Course(courseData);
        await course.save();
        totalCoursesCreated++;
        console.log(`   ✅ Course created (ID: ${course._id})`);
      }

      // Group lessons by module
      const moduleMap = {};
      lessons.forEach((lesson, index) => {
        const moduleNum = lesson.moduleNumber || Math.floor(index / 10) + 1;
        if (!moduleMap[moduleNum]) {
          moduleMap[moduleNum] = [];
        }
        moduleMap[moduleNum].push(lesson);
      });

      const moduleCount = Object.keys(moduleMap).length;
      console.log(`   📦 Organizing into ${moduleCount} modules...`);

      // Process each module
      for (const [moduleNum, moduleLessons] of Object.entries(moduleMap)) {
        console.log(`\n   📝 Module ${moduleNum}: Processing ${moduleLessons.length} lessons`);
        
        const lessonIds = [];
        let lessonsCreated = 0;
        let lessonsUpdated = 0;

        for (const lessonData of moduleLessons) {
          // Check if lesson exists
          let lesson = await Lesson.findOne({
            courseId: course._id,
            topic: lessonData.topic,
            chapterNumber: lessonData.chapterNumber
          });

          const lessonDoc = {
            ...lessonData,
            courseId: course._id,
            moduleNumber: parseInt(moduleNum),
            status: lessonData.status || 'published',
            icaiChapterRef: `${courseConfig.code}-CH${lessonData.chapterNumber}`,
            updatedAt: new Date()
          };

          if (lesson) {
            Object.assign(lesson, lessonDoc);
            await lesson.save();
            lessonsUpdated++;
          } else {
            lesson = new Lesson(lessonDoc);
            await lesson.save();
            lessonsCreated++;
          }

          lessonIds.push(lesson._id);
        }

        console.log(`      ✓ Created: ${lessonsCreated}, Updated: ${lessonsUpdated}`);
        totalLessonsCreated += lessonsCreated;
        totalLessonsUpdated += lessonsUpdated;

        // Add/update module in course
        const moduleIndex = course.modules.findIndex(m => m.moduleNumber === parseInt(moduleNum));
        const moduleData = {
          moduleNumber: parseInt(moduleNum),
          title: `Module ${moduleNum}`,
          description: `${moduleLessons.length} lessons covering ${moduleLessons[0]?.subject || courseConfig.subject}`,
          lessons: lessonIds
        };

        if (moduleIndex >= 0) {
          course.modules[moduleIndex] = moduleData;
        } else {
          course.modules.push(moduleData);
        }
      }

      // Sort modules by number
      course.modules.sort((a, b) => a.moduleNumber - b.moduleNumber);
      await course.save();

      console.log(`\n   ✅ ${courseConfig.title} integration complete!`);
      console.log(`      Modules: ${course.modules.length}`);
      console.log(`      Total Lessons: ${lessons.length}`);
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ICAI CA FOUNDATION INTEGRATION COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   ✨ Courses Created: ${totalCoursesCreated}`);
    console.log(`   🔄 Courses Updated: ${totalCoursesUpdated}`);
    console.log(`   ✨ Lessons Created: ${totalLessonsCreated}`);
    console.log(`   🔄 Lessons Updated: ${totalLessonsUpdated}`);

    // List all CA Foundation courses
    const allCourses = await Course.find({ examType: 'CA_FOUNDATION' });
    console.log(`\n📚 CA Foundation Courses in Database: ${allCourses.length}`);
    console.log('─'.repeat(70));

    for (const course of allCourses) {
      const lessonCount = await Lesson.countDocuments({ courseId: course._id });
      console.log(`\n   📖 ${course.title}`);
      console.log(`      ID: ${course._id}`);
      console.log(`      Lessons: ${lessonCount}`);
      console.log(`      Modules: ${course.modules.length}`);
      console.log(`      Price: ₹${course.price}`);
      console.log(`      ICAI Approved: ${course.icaiApproved ? '✓' : '✗'}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Materials are now accessible via Education Service API');
    console.log('='.repeat(70));
    console.log('\n📱 API Endpoints:');
    console.log('   • GET  /api/education/courses?examType=CA_FOUNDATION');
    console.log('   • GET  /api/education/courses/:courseId');
    console.log('   • GET  /api/education/lessons/:lessonId');
    console.log('   • GET  /api/education/courses/:courseId/modules');
    console.log('   • POST /api/education/lessons/:lessonId/progress');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start education service: cd services/education-service && npm start');
    console.log('   2. Test API: curl http://localhost:3010/api/education/courses?examType=CA_FOUNDATION');
    console.log('   3. Integrate with frontend');
    console.log('   4. Add video/audio URLs to lessons');
    console.log('   5. Deploy to production');

  } catch (error) {
    console.error('\n❌ Integration failed:', error);
    console.error('\nError details:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the integration
if (require.main === module) {
  console.log('\n🚀 Starting ICAI CA Foundation Materials Integration...\n');
  
  integrateICAIMaterials()
    .then(() => {
      console.log('\n✅ Integration completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Integration failed!');
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { integrateICAIMaterials };
