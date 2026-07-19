/**
 * MongoDB Complete Cleanup Script - Delete ALL Collections
 * 
 * ⚠️  DANGEROUS: This deletes EVERYTHING including users!
 * Run with: node scripts/cleanup-all-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI or MONGO_URI not set in environment variables');
  process.exit(1);
}

async function cleanupAllData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📦 Found collections:');
    collectionNames.forEach(name => console.log(`   - ${name}`));
    console.log('');
    
    let totalDocuments = 0;
    
    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        console.log(`🗑️  Deleting ${count} documents from '${collectionName}'...`);
        const result = await collection.deleteMany({});
        console.log(`   ✅ Deleted ${result.deletedCount} documents`);
        totalDocuments += result.deletedCount;
      } else {
        console.log(`⚪ Collection '${collectionName}' is already empty`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Complete cleanup finished!`);
    console.log(`   Collections processed: ${collectionNames.length}`);
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

// Extra strong warning
console.log('\n' + '🚨 DANGER '.repeat(10));
console.log('🚨 This script will DELETE ALL DATA from MongoDB!');
console.log('🚨 Including: users, sessions, courses, payments, EVERYTHING!');
console.log('🚨 This action CANNOT be undone!');
console.log('🚨 '.repeat(10) + '\n');

console.log('⏰ Starting complete database wipe in 10 seconds...');
console.log('⏰ Press Ctrl+C NOW to cancel!');
console.log('');

setTimeout(() => {
  cleanupAllData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}, 10000);
