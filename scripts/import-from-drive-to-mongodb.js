const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

/**
 * Import Course Content from Google Drive files to MongoDB
 * 
 * Prerequisites:
 * 1. Download JSON files from Google Drive
 * 2. Place them in scripts/google-drive-content/
 * 3. Ensure backend is running (MongoDB connected)
 */

require('dotenv').config({ path: path.join(__dirname, '../services/education-service/.env') });

const CONTENT_DIR = path.join(__dirname, 'google-drive-content');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superappmango';

// Course Schema (matching your backend)
const courseSchema = new mongoose.Schema({
  courseTitle: String,
  slug: { type: String, unique: true },
  examType: String,
  subject: String,
  level: String,
  description: String,
  totalDuration: Number,
  modules: [{
    moduleNumber: Number,
    moduleName: String,
    description: String,
    duration: Number,
    chapters: [{
      chapterNumber: Number,
      chapterName: String,
      description: String,
      topics: [{ name: String, description: String }]
    }]
  }],
  aiGenerated: { type: Boolean, default: true },
  status: { type: String, default: 'published' }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

/**
 * Parse and import a course file
 */
async function importCourseFile(fileName) {
  try {
    console.log(`\n📦 Processing: ${fileName}`);
    
    const filePath = path.join(CONTENT_DIR, fileName);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log(`   Size: ${(fileContent.length / 1024).toFixed(2)} KB`);

    // Determine course details from filename
    let courseInfo = {};
    
    if (fileName.includes('ca-f-acc')) {
      courseInfo = { examType: 'CA_FOUNDATION', subject: 'Accounting', level: 'FOUNDATION' };
    } else if (fileName.includes('ca-f-eco')) {
      courseInfo = { examType: 'CA_FOUNDATION', subject: 'Economics', level: 'FOUNDATION' };
    } else if (fileName.includes('ca-f-law')) {
      courseInfo = { examType: 'CA_FOUNDATION', subject: 'Business Laws', level: 'FOUNDATION' };
    } else if (fileName.includes('ca-f-maths')) {
      courseInfo = { examType: 'CA_FOUNDATION', subject: 'Mathematics', level: 'FOUNDATION' };
    } else if (fileName.includes('cbse-10')) {
      courseInfo = { examType: 'CBSE_CLASS_10', subject: 'Mathematics', level: 'INTERMEDIATE' };
    } else if (fileName.includes('ias-prelims')) {
      courseInfo = { examType: 'IAS_PRELIMS', subject: 'General Studies', level: 'ADVANCED' };
    } else if (fileName.includes('jee-m-phy')) {
      courseInfo = { examType: 'JEE_MAIN', subject: 'Physics', level: 'ADVANCED' };
    }

    // Check if data is array of modules or complete course
    let courseData;
    
    if (Array.isArray(data)) {
      // It's an array of modules/lessons
      console.log(`   Found ${data.length} items`);
      
      courseData = {
        courseTitle: `${courseInfo.examType} - ${courseInfo.subject}`,
        slug: fileName.replace('.json', '').toLowerCase(),
        ...courseInfo,
        description: `Complete ${courseInfo.subject} course for ${courseInfo.examType}`,
        totalDuration: data.length * 3,
        modules: data.map((item, index) => ({
          moduleNumber: index + 1,
          moduleName: item.title || item.name || `Module ${index + 1}`,
          description: item.description || item.title || '',
          duration: 3,
          chapters: [{
            chapterNumber: 1,
            chapterName: item.title || item.name || `Chapter 1`,
            description: item.description || '',
            topics: (item.topics || []).map(t => ({
              name: typeof t === 'string' ? t : t.name,
              description: typeof t === 'object' ? t.description : ''
            }))
          }]
        })),
        aiGenerated: true,
        status: 'published'
      };
    } else if (data.courseTitle) {
      // It's already a complete course object
      courseData = {
        ...data,
        ...courseInfo,
        slug: data.slug || fileName.replace('.json', '').toLowerCase()
      };
    } else {
      console.log(`   ⚠️  Unrecognized format, skipping`);
      return false;
    }

    // Check if course already exists
    const existing = await Course.findOne({ slug: courseData.slug });
    
    if (existing) {
      console.log(`   ⚠️  Course already exists: ${existing.courseTitle}`);
      console.log(`   Updating...`);
      
      await Course.findOneAndUpdate(
        { slug: courseData.slug },
        courseData,
        { new: true }
      );
      
      console.log(`   ✅ Updated!`);
    } else {
      const course = new Course(courseData);
      await course.save();
      console.log(`   ✅ Imported: ${courseData.courseTitle}`);
      console.log(`      Modules: ${courseData.modules.length}`);
    }

    return true;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  📥 IMPORT GOOGLE DRIVE CONTENT TO MONGODB                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}\n`);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB!\n');

    // Check if content directory exists
    try {
      await fs.access(CONTENT_DIR);
      console.log(`📁 Content directory: ${CONTENT_DIR}\n`);
    } catch (error) {
      console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
      console.log('\n💡 Please:');
      console.log('1. Download JSON files from Google Drive');
      console.log('2. Place them in: scripts/google-drive-content/');
      console.log('3. Run this script again\n');
      process.exit(1);
    }

    // Get list of JSON files
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'manifest.json');

    console.log(`📊 Found ${jsonFiles.length} course files:\n`);
    jsonFiles.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
    console.log('\n' + '─'.repeat(70) + '\n');

    // Import each file
    let imported = 0;
    let failed = 0;

    for (const file of jsonFiles) {
      const success = await importCourseFile(file);
      if (success) imported++;
      else failed++;
    }

    console.log('\n' + '═'.repeat(70));
    console.log('🎉 IMPORT COMPLETE!');
    console.log('═'.repeat(70));
    console.log(`✅ Imported: ${imported} courses`);
    console.log(`❌ Failed: ${failed} courses`);
    console.log('\n💡 Courses are now available in MongoDB!');
    console.log('   Your application can access them via the API.\n');

    // Verify import
    const totalCourses = await Course.countDocuments();
    console.log(`📊 Total courses in database: ${totalCourses}\n`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

main();
