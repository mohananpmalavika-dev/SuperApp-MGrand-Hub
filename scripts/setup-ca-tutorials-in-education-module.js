/**
 * Setup CA Foundation Tutorials in Education Module
 * This script imports CA Foundation content into your education service
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mgrand-hub';

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
  modules: [{
    moduleNumber: Number,
    title: String,
    description: String,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
  }],
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
  quickRevision: {
    summary: [String],
    formulas: [String],
    mnemonics: [String]
  },
  examTips: [String],
  commonMistakes: [String],
  practiceQuestionsCount: Number,
  videoUrl: String,
  audioUrl: String,
  notesUrl: String,
  resources: [{
    title: String,
    url: String,
    type: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

// CA Foundation course metadata
const caFoundationCourses = [
  {
    fileName: 'ca-f-accounting.json',
    courseData: {
      title: 'CA Foundation - Accounting',
      description: 'Complete Accounting course for CA Foundation covering all topics with detailed explanations, examples, and practice questions.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Accounting',
      level: 'Foundation',
      totalLessons: 12,
      instructor: 'CA Expert Team',
      price: 4999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Accounting',
      tags: ['CA', 'Accounting', 'Foundation', 'Professional Course', 'Indian Exam']
    }
  },
  {
    fileName: 'ca-f-business-economics.json',
    courseData: {
      title: 'CA Foundation - Business Economics',
      description: 'Comprehensive Business Economics course for CA Foundation with real-world examples and exam-focused content.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Economics',
      level: 'Foundation',
      totalLessons: 10,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Economics',
      tags: ['CA', 'Economics', 'Foundation', 'Professional Course', 'Indian Exam']
    }
  },
  {
    fileName: 'ca-f-business-laws.json',
    courseData: {
      title: 'CA Foundation - Business Laws',
      description: 'Complete Business Laws course for CA Foundation covering Indian Contract Act, Sale of Goods Act, and more.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Laws',
      level: 'Foundation',
      totalLessons: 10,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Laws',
      tags: ['CA', 'Business Laws', 'Foundation', 'Professional Course', 'Indian Exam']
    }
  },
  {
    fileName: 'ca-f-business-mathematics.json',
    courseData: {
      title: 'CA Foundation - Business Mathematics',
      description: 'Business Mathematics and Logical Reasoning for CA Foundation with step-by-step solutions.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Mathematics',
      level: 'Foundation',
      totalLessons: 10,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225?text=CA+Foundation+Maths',
      tags: ['CA', 'Mathematics', 'Foundation', 'Professional Course', 'Indian Exam']
    }
  }
];

async function setupCATutorials() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let totalCoursesCreated = 0;
    let totalLessonsCreated = 0;

    for (const courseConfig of caFoundationCourses) {
      const { fileName, courseData } = courseConfig;
      const filePath = path.join(__dirname, 'google-drive-content', fileName);

      console.log(`📚 Processing: ${courseData.title}`);
      console.log(`   File: ${fileName}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found: ${filePath}`);
        console.log(`   ⏭️  Skipping...\n`);
        continue;
      }

      // Read lessons from file
      const lessonsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   📖 Found ${lessonsData.length} lessons`);

      // Check if course already exists
      let course = await Course.findOne({ 
        title: courseData.title,
        examType: courseData.examType 
      });

      if (course) {
        console.log(`   ℹ️  Course already exists (ID: ${course._id})`);
        console.log(`   🔄 Updating course data...`);
        
        // Update course metadata
        course.description = courseData.description;
        course.totalLessons = lessonsData.length;
        course.updatedAt = new Date();
        await course.save();
      } else {
        // Create new course
        console.log(`   ✨ Creating new course...`);
        course = new Course({
          ...courseData,
          totalLessons: lessonsData.length,
          duration: lessonsData.reduce((sum, l) => sum + (l.duration || 0), 0),
          modules: []
        });
        await course.save();
        totalCoursesCreated++;
        console.log(`   ✅ Course created (ID: ${course._id})`);
      }

      // Group lessons by module
      const moduleMap = {};
      lessonsData.forEach(lesson => {
        const moduleNum = lesson.moduleNumber || 1;
        if (!moduleMap[moduleNum]) {
          moduleMap[moduleNum] = [];
        }
        moduleMap[moduleNum].push(lesson);
      });

      console.log(`   📦 Organizing into ${Object.keys(moduleMap).length} modules...`);

      // Clear existing modules
      course.modules = [];

      // Create lessons and modules
      for (const moduleNum of Object.keys(moduleMap).sort((a, b) => a - b)) {
        const moduleLessons = moduleMap[moduleNum];
        const lessonIds = [];

        console.log(`   📝 Module ${moduleNum}: ${moduleLessons.length} lessons`);

        for (const lessonData of moduleLessons) {
          // Check if lesson already exists
          let lesson = await Lesson.findOne({
            courseId: course._id,
            topic: lessonData.topic
          });

          if (lesson) {
            // Update existing lesson
            Object.assign(lesson, {
              ...lessonData,
              courseId: course._id,
              updatedAt: new Date()
            });
            await lesson.save();
          } else {
            // Create new lesson
            lesson = new Lesson({
              ...lessonData,
              courseId: course._id
            });
            await lesson.save();
            totalLessonsCreated++;
          }

          lessonIds.push(lesson._id);
        }

        // Add module to course
        course.modules.push({
          moduleNumber: parseInt(moduleNum),
          title: `Module ${moduleNum}`,
          description: `Module ${moduleNum} covering ${moduleLessons.length} topics`,
          lessons: lessonIds
        });
      }

      await course.save();
      console.log(`   ✅ ${courseData.title} setup complete!\n`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CA FOUNDATION TUTORIALS SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log(`✅ Courses created: ${totalCoursesCreated}`);
    console.log(`✅ Lessons created: ${totalLessonsCreated}`);
    console.log(`✅ Total courses: ${caFoundationCourses.length}`);
    
    // List all courses
    const allCourses = await Course.find({ examType: 'CA_FOUNDATION' });
    console.log(`\n📚 CA Foundation Courses in Database:`);
    for (const course of allCourses) {
      const lessonCount = await Lesson.countDocuments({ courseId: course._id });
      console.log(`   • ${course.title} (${lessonCount} lessons)`);
      console.log(`     ID: ${course._id}`);
      console.log(`     Price: ₹${course.price}`);
    }

    console.log('\n✅ Your CA tutorials are now accessible via the education module!');
    console.log('\n📱 Access via:');
    console.log('   • GET /api/education/courses (list all courses)');
    console.log('   • GET /api/education/courses/:courseId (course details)');
    console.log('   • GET /api/education/lessons/:lessonId (lesson content)');
    console.log('   • GET /api/education/courses/exam-type/CA_FOUNDATION (CA courses)');
    
  } catch (error) {
    console.error('\n❌ Error setting up CA tutorials:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
if (require.main === module) {
  setupCATutorials()
    .then(() => {
      console.log('\n✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupCATutorials };
