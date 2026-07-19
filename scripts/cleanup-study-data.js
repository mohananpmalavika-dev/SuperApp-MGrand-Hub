/**
 * MongoDB Cleanup Script - Delete Study Material Data
 * 
 * This script deletes all study-related data from MongoDB
 * Run with: node scripts/cleanup-study-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI or MONGO_URI not set in environment variables');
  process.exit(1);
}

// Collections to clean up
const COLLECTIONS_TO_DELETE = [
  // Tutor Service Collections
  'tutorsessions',
  'quizzes',
  'learningpaths',
  'tutorachievements',
  
  // Education Service Collections
  'courses',
  'lessons',
  'enrollments',
  'progress',
  'studyplans',
  'assessments',
  'certificates',
  'coursecategories',
  'lessoncontents',
  'userprogresss', // Note: might be 'userprogress' without double 's'
  
  // Additional study-related collections
  'flashcards',
  'notes',
  'bookmarks',
  'studysessions',
];

async function cleanupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`); // Hide password
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get all collections in the database
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📦 Found collections:', collectionNames.join(', '));
    console.log('');
    
    let deletedCount = 0;
    let totalDocuments = 0;
    
    for (const collectionName of COLLECTIONS_TO_DELETE) {
      if (collectionNames.includes(collectionName)) {
        const collection = db.collection(collectionName);
        
        // Count documents before deletion
        const count = await collection.countDocuments();
        
        if (count > 0) {
          console.log(`🗑️  Deleting ${count} documents from '${collectionName}'...`);
          
          const result = await collection.deleteMany({});
          
          console.log(`   ✅ Deleted ${result.deletedCount} documents`);
          deletedCount++;
          totalDocuments += result.deletedCount;
        } else {
          console.log(`⚪ Collection '${collectionName}' is already empty`);
        }
      } else {
        console.log(`⚪ Collection '${collectionName}' does not exist (skipping)`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Cleanup completed!`);
    console.log(`   Collections cleaned: ${deletedCount}`);
    console.log(`   Total documents deleted: ${totalDocuments}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Warning message
console.log('\n' + '⚠️  WARNING '.repeat(8));
console.log('⚠️  This script will DELETE ALL study material data from MongoDB!');
console.log('⚠️  This action CANNOT be undone!');
console.log('⚠️  '.repeat(8) + '\n');

console.log('Collections that will be cleaned:');
COLLECTIONS_TO_DELETE.forEach(name => console.log(`  - ${name}`));
console.log('');

// Safety delay
console.log('Starting cleanup in 5 seconds...');
console.log('Press Ctrl+C to cancel');
console.log('');

setTimeout(() => {
  cleanupDatabase()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}, 5000);
