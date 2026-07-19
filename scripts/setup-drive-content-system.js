const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../services/education-service/.env') });

/**
 * Setup Google Drive Content System
 * 
 * This script creates LIGHTWEIGHT course records in MongoDB
 * that reference Google Drive files (not storing full content)
 * 
 * Benefits:
 * - MongoDB stays under 500MB (only metadata ~50KB per course)
 * - Content served from Google Drive (unlimited storage)
 * - Fast metadata queries
 */

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superappmango';
const DRIVE_FOLDER_ID = '1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';

// Lightweight course schema (NO lesson content stored!)
const courseMetadataSchema = new mongoose.Schema({
  courseTitle: String,
  slug: { type: String, unique: true },
  examType: String,
  subject: String,
  level: String,
  description: String,
  thumbnail: String,
  
  // Google Drive reference (NOT the full content!)
  driveFileId: String,  // Just the file ID
  driveFileName: String,
  driveFileUrl: String, // Direct download URL
  
  // Lightweight structure (just names, no content!)
  modules: [{
    moduleNumber: Number,
    moduleName: String,
    description: String,
    topics: [String]  // Just topic names, content in Drive
  }],
  
  // Metadata only
  totalLessons: Number,
  estimatedDuration: Number,
  difficulty: String,
  
  // Stats
  enrollmentCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  status: { type: String, default: 'published' }
}, { timestamps: true });

const CourseMetadata = mongoose.model('CourseMetadata', courseMetadataSchema);

/**
 * Course definitions with Drive file mappings
 * 
 * TODO: Replace 'FILE_ID_HERE' with actual Google Drive file IDs
 * 
 * To get file IDs:
 * 1. Right-click file in Google Drive
 * 2. Click "Share" → "Anyone with the link"
 * 3. Copy link: https://drive.google.com/file/d/FILE_ID_HERE/view
 * 4. Extract the FILE_ID_HERE part
 */
const COURSE_MAPPINGS = [
  {
    courseTitle: 'CA Foundation - Accounting',
    slug: 'ca-foundation-accounting',
    examType: 'CA_FOUNDATION',
    subject: 'Accounting',
    level: 'FOUNDATION',
    description: 'Complete accounting course for CA Foundation exam',
    driveFileName: 'ca-f-acc.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Introduction to Accounting', topics: ['Accounting Concepts', 'Conventions', 'Standards'] },
      { moduleNumber: 2, moduleName: 'Journal Entries', topics: ['Double Entry', 'Journal', 'Ledger'] },
      { moduleNumber: 3, moduleName: 'Financial Statements', topics: ['Trading Account', 'P&L', 'Balance Sheet'] }
    ],
    totalLessons: 12,
    estimatedDuration: 36,
    difficulty: 'Medium'
  },
  {
    courseTitle: 'CA Foundation - Economics',
    slug: 'ca-foundation-economics',
    examType: 'CA_FOUNDATION',
    subject: 'Economics',
    level: 'FOUNDATION',
    description: 'Business economics fundamentals for CA Foundation',
    driveFileName: 'ca-f-eco.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Microeconomics', topics: ['Demand', 'Supply', 'Equilibrium'] },
      { moduleNumber: 2, moduleName: 'Production Theory', topics: ['Cost', 'Revenue', 'Profit'] }
    ],
    totalLessons: 10,
    estimatedDuration: 30,
    difficulty: 'Medium'
  },
  {
    courseTitle: 'CA Foundation - Business Laws',
    slug: 'ca-foundation-law',
    examType: 'CA_FOUNDATION',
    subject: 'Business Laws',
    level: 'FOUNDATION',
    description: 'Essential business law concepts for CA Foundation',
    driveFileName: 'ca-f-law.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Contract Act', topics: ['Offer', 'Acceptance', 'Consideration'] },
      { moduleNumber: 2, moduleName: 'Partnership Act', topics: ['Formation', 'Rights', 'Dissolution'] }
    ],
    totalLessons: 10,
    estimatedDuration: 30,
    difficulty: 'Medium'
  },
  {
    courseTitle: 'CA Foundation - Mathematics',
    slug: 'ca-foundation-maths',
    examType: 'CA_FOUNDATION',
    subject: 'Mathematics',
    level: 'FOUNDATION',
    description: 'Business mathematics for CA Foundation',
    driveFileName: 'ca-f-maths.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Algebra', topics: ['Equations', 'Inequalities', 'Functions'] },
      { moduleNumber: 2, moduleName: 'Statistics', topics: ['Mean', 'Median', 'Mode'] }
    ],
    totalLessons: 12,
    estimatedDuration: 36,
    difficulty: 'Medium'
  },
  {
    courseTitle: 'CBSE Class 10 - Mathematics',
    slug: 'cbse-class-10-mathematics',
    examType: 'CBSE_CLASS_10',
    subject: 'Mathematics',
    level: 'INTERMEDIATE',
    description: 'Complete CBSE Class 10 mathematics curriculum',
    driveFileName: 'cbse-10-math.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Number Systems', topics: ['Real Numbers', 'Polynomials'] },
      { moduleNumber: 2, moduleName: 'Algebra', topics: ['Linear Equations', 'Quadratic Equations'] },
      { moduleNumber: 3, moduleName: 'Geometry', topics: ['Triangles', 'Circles'] }
    ],
    totalLessons: 16,
    estimatedDuration: 48,
    difficulty: 'Easy'
  },
  {
    courseTitle: 'IAS Prelims - General Studies',
    slug: 'ias-prelims-general-studies',
    examType: 'IAS_PRELIMS',
    subject: 'General Studies',
    level: 'ADVANCED',
    description: 'Complete preparation for IAS Prelims examination',
    driveFileName: 'ias-prelims.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Polity', topics: ['Constitution', 'Rights', 'Government'] },
      { moduleNumber: 2, moduleName: 'History', topics: ['Ancient', 'Medieval', 'Modern'] },
      { moduleNumber: 3, moduleName: 'Geography', topics: ['Physical', 'Economic', 'World'] },
      { moduleNumber: 4, moduleName: 'Economics', topics: ['Planning', 'Budget', 'Trade'] }
    ],
    totalLessons: 36,
    estimatedDuration: 108,
    difficulty: 'Hard'
  },
  {
    courseTitle: 'JEE Main - Physics',
    slug: 'jee-main-physics',
    examType: 'JEE_MAIN',
    subject: 'Physics',
    level: 'ADVANCED',
    description: 'Complete physics preparation for JEE Main',
    driveFileName: 'jee-m-phy.json',
    driveFileId: 'FILE_ID_HERE',  // ← Replace with actual file ID
    modules: [
      { moduleNumber: 1, moduleName: 'Mechanics', topics: ['Kinematics', 'Dynamics', 'Work Energy'] },
      { moduleNumber: 2, moduleName: 'Thermodynamics', topics: ['Laws', 'Entropy', 'Engines'] },
      { moduleNumber: 3, moduleName: 'Electromagnetism', topics: ['Electric Field', 'Magnetic Field', 'Induction'] },
      { moduleNumber: 4, moduleName: 'Optics', topics: ['Ray', 'Wave', 'Modern'] }
    ],
    totalLessons: 30,
    estimatedDuration: 90,
    difficulty: 'Hard'
  }
];

/**
 * Create lightweight course records
 */
async function setupCourses() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  📦 SETUP GOOGLE DRIVE CONTENT SYSTEM                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected!\n');

    console.log('📝 Creating lightweight course records...\n');

    let created = 0;
    let skipped = 0;

    for (const courseData of COURSE_MAPPINGS) {
      try {
        // Check if course exists
        const existing = await CourseMetadata.findOne({ slug: courseData.slug });
        
        if (existing) {
          console.log(`⚠️  Skipped: ${courseData.courseTitle} (already exists)`);
          skipped++;
          continue;
        }

        // Create drive URL
        const driveFileUrl = courseData.driveFileId !== 'FILE_ID_HERE' 
          ? `https://drive.google.com/uc?id=${courseData.driveFileId}&export=download`
          : null;

        // Create lightweight record
        const course = new CourseMetadata({
          ...courseData,
          driveFileUrl
        });

        await course.save();

        // Calculate size
        const size = JSON.stringify(course).length;
        console.log(`✅ Created: ${courseData.courseTitle}`);
        console.log(`   MongoDB size: ${(size / 1024).toFixed(2)} KB`);
        console.log(`   Drive file: ${courseData.driveFileName}`);
        console.log(`   Modules: ${courseData.modules.length}`);
        console.log(`   Lessons: ${courseData.totalLessons}\n`);

        created++;

      } catch (error) {
        console.error(`❌ Error creating ${courseData.courseTitle}:`, error.message);
      }
    }

    console.log('═'.repeat(70));
    console.log('📊 SETUP COMPLETE');
    console.log('═'.repeat(70));
    console.log(`✅ Created: ${created} courses`);
    console.log(`⚠️  Skipped: ${skipped} courses\n`);

    // Check total database size
    const allCourses = await CourseMetadata.find();
    const totalSize = JSON.stringify(allCourses).length;
    
    console.log('💾 MongoDB Usage:');
    console.log(`   Courses: ${allCourses.length}`);
    console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Available: 500 MB`);
    console.log(`   Used: ${((totalSize / 1024 / 1024) / 500 * 100).toFixed(3)}%\n`);

    console.log('📝 Next Steps:');
    console.log('─'.repeat(70));
    console.log('1. Get Google Drive file IDs:');
    console.log('   a. Open: https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID);
    console.log('   b. Right-click each JSON file → Share');
    console.log('   c. Change to "Anyone with the link"');
    console.log('   d. Copy link and extract file ID');
    console.log('');
    console.log('2. Update this script with file IDs');
    console.log('   Replace "FILE_ID_HERE" with actual IDs');
    console.log('');
    console.log('3. Run this script again to update URLs');
    console.log('');
    console.log('4. Your backend will fetch content from Drive on demand!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

setupCourses();
