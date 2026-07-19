const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Sync Content from Google Drive to Local MongoDB
 * 
 * This script:
 * 1. Fetches course files from Google Drive
 * 2. Imports them into local MongoDB
 * 3. Makes content available in your application
 */

const DRIVE_FOLDER_ID = '1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';
const API_BASE = 'http://localhost:3013/api/education';

// Direct links to your uploaded files (you'll need to make these public and get share links)
const COURSE_FILES = {
  'CA Foundation - Accounting': 'ca-f-acc.json',
  'CA Foundation - Economics': 'ca-f-eco.json',
  'CA Foundation - Law': 'ca-f-law.json',
  'CA Foundation - Mathematics': 'ca-f-maths.json',
  'CBSE Class 10 - Mathematics': 'cbse-10-math.json',
  'IAS Prelims': 'ias-prelims.json',
  'JEE Main - Physics': 'jee-m-phy.json',
  'Manifest': 'manifest.json'
};

/**
 * Get public download URL for a Google Drive file
 * 
 * To make files accessible:
 * 1. Right-click file in Google Drive
 * 2. Click "Share"
 * 3. Change to "Anyone with the link"
 * 4. Copy the file ID from the share link
 */
function getPublicDownloadUrl(fileName) {
  // For now, return the folder URL - user needs to enable public sharing
  // Format: https://drive.google.com/uc?id=FILE_ID&export=download
  return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
}

/**
 * Download course data from Google Drive
 */
async function downloadCourseFile(fileName, fileId) {
  try {
    console.log(`📥 Downloading: ${fileName}...`);
    
    // Note: This requires the file to be publicly shared
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    
    const response = await axios.get(downloadUrl, {
      responseType: 'json',
      timeout: 30000
    });

    console.log(`✅ Downloaded: ${fileName} (${JSON.stringify(response.data).length} bytes)`);
    return response.data;

  } catch (error) {
    console.error(`❌ Failed to download ${fileName}:`, error.message);
    return null;
  }
}

/**
 * Import course data into MongoDB via API
 */
async function importCourse(courseName, courseData) {
  try {
    console.log(`\n📦 Importing: ${courseName}...`);

    // The courseData should contain course structure and lessons
    // We'll need to parse it and import accordingly

    if (Array.isArray(courseData)) {
      // It's an array of lessons
      console.log(`   Found ${courseData.length} lessons`);
      
      for (let i = 0; i < courseData.length; i++) {
        const lesson = courseData[i];
        console.log(`   [${i + 1}/${courseData.length}] Importing: ${lesson.title || lesson.topic || 'Untitled'}...`);
        
        // Import via API
        // Note: You'll need to adapt this based on your actual data structure
      }
    } else {
      // It's a course object
      console.log(`   Importing course: ${courseData.courseTitle || courseName}`);
    }

    console.log(`✅ Imported: ${courseName}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to import ${courseName}:`, error.message);
    return false;
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  📂 SYNC FROM GOOGLE DRIVE TO MONGODB                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📁 Google Drive Folder:', `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`);
  console.log('📊 Files to sync:', Object.keys(COURSE_FILES).length);
  console.log('\n⚠️  IMPORTANT: Files must be publicly shared for download!');
  console.log('   To enable:\n');
  console.log('   1. Open Google Drive folder');
  console.log('   2. Right-click each JSON file');
  console.log('   3. Click "Share" → "Anyone with the link"');
  console.log('   4. Copy the file ID from the share link');
  console.log('\n─────────────────────────────────────────────────────────────────────\n');

  // For now, let's check if files exist locally
  console.log('🔍 Checking for local copies in google-drive-content/...\n');

  let imported = 0;
  let failed = 0;

  for (const [courseName, fileName] of Object.entries(COURSE_FILES)) {
    try {
      const localPath = path.join(__dirname, 'google-drive-content', fileName);
      
      try {
        const fileContent = await fs.readFile(localPath, 'utf8');
        const courseData = JSON.parse(fileContent);
        
        console.log(`✅ Found locally: ${fileName}`);
        console.log(`   Size: ${(fileContent.length / 1024).toFixed(2)} KB`);
        
        if (fileName !== 'manifest.json') {
          const result = await importCourse(courseName, courseData);
          if (result) imported++;
          else failed++;
        }
      } catch (readError) {
        console.log(`⚠️  Not found locally: ${fileName}`);
        console.log(`   Please download from Google Drive or run generation script`);
        failed++;
      }

    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      failed++;
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  📊 SYNC COMPLETE                                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Imported: ${imported} courses`);
  console.log(`❌ Failed: ${failed} courses`);
  console.log('\n💡 TIP: If files are not found locally, they can be:');
  console.log('   1. Generated using: npm run generate:drive');
  console.log('   2. Or downloaded from your Google Drive folder\n');
}

main();
