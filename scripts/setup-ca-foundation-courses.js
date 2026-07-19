/**
 * Setup Script: CA Foundation Courses
 * 
 * This script creates course records in MongoDB with Google Drive file IDs
 * Run this after uploading files to Google Drive and getting their IDs
 * 
 * Usage: node scripts/setup-ca-foundation-courses.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superappmango';

// Course Schema
const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  subcategory: String,
  difficulty: String,
  driveFileId: String,
  totalLessons: Number,
  estimatedHours: Number,
  subjects: [String],
  rating: Number,
  enrolledCount: Number,
  isPublished: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

// TODO: Replace these with actual Google Drive file IDs after upload
const DRIVE_FILE_IDS = {
  accounting: 'YOUR_ACCOUNTING_FILE_ID',           // ca-f-accounting-complete.json
  businessLaws: 'YOUR_BUSINESS_LAWS_FILE_ID',      // ca-f-business-laws-complete.json
  businessMaths: 'YOUR_BUSINESS_MATHS_FILE_ID',    // ca-f-business-mathematics-complete.json
  businessEconomics: 'YOUR_BUSINESS_ECONOMICS_FILE_ID' // ca-f-business-economics-complete.json
};

const courses = [
  {
    name: 'CA Foundation - Accounting',
    description: 'Comprehensive accounting course covering fundamental principles, journal entries, ledgers, trial balance, and financial statements. Includes 12 detailed lessons with video lectures, audio content, and practice questions.',
    category: 'professional',
    subcategory: 'CA Foundation',
    difficulty: 'intermediate',
    driveFileId: DRIVE_FILE_IDS.accounting,
    totalLessons: 12,
    estimatedHours: 120,
    subjects: ['Accounting', 'Financial Accounting', 'Book Keeping'],
    rating: 4.5,
    enrolledCount: 0,
    isPublished: true
  },
  {
    name: 'CA Foundation - Business Laws',
    description: 'Complete coverage of Indian business laws including Contract Act, Sale of Goods Act, Partnership Act, and Companies Act. 10 comprehensive lessons with case studies and exam-oriented content.',
    category: 'professional',
    subcategory: 'CA Foundation',
    difficulty: 'intermediate',
    driveFileId: DRIVE_FILE_IDS.businessLaws,
    totalLessons: 10,
    estimatedHours: 100,
    subjects: ['Business Law', 'Contract Law', 'Company Law'],
    rating: 4.5,
    enrolledCount: 0,
    isPublished: true
  },
  {
    name: 'CA Foundation - Business Mathematics',
    description: 'Essential mathematics for commerce students covering algebra, calculus, statistics, and financial mathematics. 12 lessons with solved examples, practice problems, and exam tips.',
    category: 'professional',
    subcategory: 'CA Foundation',
    difficulty: 'intermediate',
    driveFileId: DRIVE_FILE_IDS.businessMaths,
    totalLessons: 12,
    estimatedHours: 130,
    subjects: ['Mathematics', 'Statistics', 'Financial Mathematics'],
    rating: 4.5,
    enrolledCount: 0,
    isPublished: true
  },
  {
    name: 'CA Foundation - Business Economics',
    description: 'Fundamental economic concepts for commerce including microeconomics, macroeconomics, demand-supply, market structures, and Indian economy. 10 detailed lessons with real-world examples.',
    category: 'professional',
    subcategory: 'CA Foundation',
    difficulty: 'intermediate',
    driveFileId: DRIVE_FILE_IDS.businessEconomics,
    totalLessons: 10,
    estimatedHours: 110,
    subjects: ['Economics', 'Microeconomics', 'Macroeconomics'],
    rating: 4.5,
    enrolledCount: 0,
    isPublished: true
  }
];

async function setupCourses() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if file IDs are set
    const notSet = Object.entries(DRIVE_FILE_IDS).filter(([key, val]) => val.startsWith('YOUR_'));
    if (notSet.length > 0) {
      console.log('\n⚠️  WARNING: Google Drive file IDs not set yet!');
      console.log('Please update DRIVE_FILE_IDS in this script with your actual file IDs.\n');
      console.log('Files to upload:');
      console.log('  1. ca-f-accounting-complete.json → accounting');
      console.log('  2. ca-f-business-laws-complete.json → businessLaws');
      console.log('  3. ca-f-business-mathematics-complete.json → businessMaths');
      console.log('  4. ca-f-business-economics-complete.json → businessEconomics\n');
      
      // Ask if user wants to proceed anyway (for testing)
      console.log('Proceeding with placeholder IDs for testing...\n');
    }

    console.log('📚 Creating CA Foundation courses...\n');

    for (const courseData of courses) {
      // Check if course already exists
      const existing = await Course.findOne({ 
        name: courseData.name,
        subcategory: 'CA Foundation'
      });

      if (existing) {
        console.log(`⚠️  Course already exists: ${courseData.name}`);
        console.log(`   Updating with new data...`);
        
        // Update existing course
        existing.driveFileId = courseData.driveFileId;
        existing.description = courseData.description;
        existing.totalLessons = courseData.totalLessons;
        existing.estimatedHours = courseData.estimatedHours;
        existing.subjects = courseData.subjects;
        existing.updatedAt = new Date();
        
        await existing.save();
        console.log(`✅ Updated: ${courseData.name}`);
        console.log(`   Drive File ID: ${courseData.driveFileId}`);
        console.log(`   Lessons: ${courseData.totalLessons}, Hours: ${courseData.estimatedHours}\n`);
      } else {
        // Create new course
        const course = new Course(courseData);
        await course.save();
        
        console.log(`✅ Created: ${courseData.name}`);
        console.log(`   Drive File ID: ${courseData.driveFileId}`);
        console.log(`   Lessons: ${courseData.totalLessons}, Hours: ${courseData.estimatedHours}\n`);
      }
    }

    // Display summary
    const allCourses = await Course.find({ subcategory: 'CA Foundation' });
    console.log('\n📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total CA Foundation Courses: ${allCourses.length}`);
    console.log(`Total Lessons: ${allCourses.reduce((sum, c) => sum + c.totalLessons, 0)}`);
    console.log(`Total Hours: ${allCourses.reduce((sum, c) => sum + c.estimatedHours, 0)}`);
    console.log('\nCourses:');
    allCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name}`);
      console.log(`     ID: ${course._id}`);
      console.log(`     Drive File: ${course.driveFileId}`);
      console.log(`     Lessons: ${course.totalLessons}, Hours: ${course.estimatedHours}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✨ Setup complete!');
    console.log('\n📱 Next Steps:');
    console.log('  1. Start your frontend: npm start');
    console.log('  2. Navigate to: http://localhost:3000/education/courses');
    console.log('  3. You should see all 4 CA Foundation courses!');
    console.log('  4. Click any course to view lessons');
    console.log('  5. Click any lesson to view content from Google Drive\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run setup
setupCourses();
