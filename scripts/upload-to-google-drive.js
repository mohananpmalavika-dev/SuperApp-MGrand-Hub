const { exec } = require('child_process');
const path = require('path');

/**
 * Open Google Drive and Local Folder for Easy Upload
 * 
 * This script:
 * 1. Opens your Google Drive folder in browser
 * 2. Opens the local generated content folder in File Explorer
 * 3. You simply drag & drop from Explorer to Drive
 */

const GOOGLE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';
const LOCAL_CONTENT_FOLDER = path.join(__dirname, 'google-drive-content');

console.log('\n🚀 Opening Google Drive Upload Interface\n');
console.log('════════════════════════════════════════');

// Open Google Drive in browser
console.log('📂 Opening Google Drive folder in browser...');
exec(`start ${GOOGLE_DRIVE_FOLDER}`, (error) => {
  if (error) {
    console.error('❌ Error opening browser:', error.message);
    console.log('   Please manually open:', GOOGLE_DRIVE_FOLDER);
  } else {
    console.log('✅ Google Drive opened!');
  }
});

// Wait a moment, then open local folder
setTimeout(() => {
  console.log('\n📁 Opening local content folder in File Explorer...');
  exec(`explorer "${LOCAL_CONTENT_FOLDER}"`, (error) => {
    if (error) {
      console.error('❌ Error opening File Explorer:', error.message);
      console.log('   Please manually open:', LOCAL_CONTENT_FOLDER);
    } else {
      console.log('✅ File Explorer opened!');
    }
  });

  console.log('\n════════════════════════════════════════');
  console.log('📤 UPLOAD INSTRUCTIONS:');
  console.log('════════════════════════════════════════');
  console.log('1. ✅ Browser: Google Drive folder is now open');
  console.log('2. ✅ Explorer: Local content folder is now open');
  console.log('3. 👉 Drag & drop the entire "google-drive-content" folder');
  console.log('4. ⏳ Wait for upload to complete (~18 GB)');
  console.log('5. 🎉 Content is now accessible from Google Drive!');
  console.log('\n💡 TIP: You can also upload individual track folders');
  console.log('   (CA-Foundation, JEE-Physics, etc.) one at a time');
  console.log('════════════════════════════════════════\n');
}, 2000);
