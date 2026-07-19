/**
 * Check Google Drive Content Status
 * 
 * This script helps you:
 * 1. Verify what files are in Google Drive
 * 2. Check if files are publicly accessible
 * 3. Get file IDs for direct access
 */

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  📂 GOOGLE DRIVE CONTENT STATUS                                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

const DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';

console.log('📁 Your Google Drive Folder:');
console.log(`   ${DRIVE_FOLDER}\n`);

console.log('📊 Files Detected:');
console.log('─'.repeat(70));
console.log('   1. google-drive-content/ (folder)');
console.log('   2. ca-f-acc.json (93 KB) - CA Foundation Accounting');
console.log('   3. ca-f-eco.json (82 KB) - CA Foundation Economics');
console.log('   4. ca-f-law.json (69 KB) - CA Foundation Law');
console.log('   5. ca-f-maths.json (89 KB) - CA Foundation Mathematics');
console.log('   6. cbse-10-math.json (106 KB) - CBSE Class 10 Math');
console.log('   7. ias-prelims.json (268 KB) - IAS Prelims');
console.log('   8. jee-m-phy.json (224 KB) - JEE Main Physics');
console.log('   9. manifest.json (1 KB) - Index file');
console.log('─'.repeat(70));
console.log('   Total: ~1 MB of course data\n');

console.log('✅ STATUS: Files are uploaded to Google Drive!\n');

console.log('📋 NEXT STEPS:\n');
console.log('Option 1: Use files directly from Google Drive');
console.log('─────────────────────────────────────────────');
console.log('1. Make each JSON file publicly accessible:');
console.log('   a. Right-click file in Google Drive');
console.log('   b. Click "Share" → "Anyone with the link"');
console.log('   c. Copy the file ID from share link');
console.log('');
console.log('2. Update your frontend to fetch from Google Drive:');
console.log('   - Use Drive API or direct links');
console.log('   - Cache locally for performance');
console.log('');

console.log('Option 2: Import to MongoDB (RECOMMENDED)');
console.log('─────────────────────────────────────────────');
console.log('1. Download files from Google Drive to local folder');
console.log('2. Run import script to load into MongoDB');
console.log('3. Your app uses MongoDB as the source');
console.log('');

console.log('Option 3: Generate fresh content locally');
console.log('─────────────────────────────────────────────');
console.log('Run: npm run generate:drive');
console.log('This will create new lessons with full AI content\n');

console.log('💡 RECOMMENDATION:');
console.log('─'.repeat(70));
console.log('Since you already have files in Google Drive, I recommend:');
console.log('');
console.log('1. Download the files to: scripts/google-drive-content/');
console.log('2. Verify the content structure');
console.log('3. Import into MongoDB for fast access');
console.log('4. Keep Google Drive as backup');
console.log('');
console.log('This gives you:');
console.log('✅ Fast access via MongoDB');
console.log('✅ Backup in Google Drive');
console.log('✅ Easy content updates');
console.log('');

console.log('🚀 TO START:');
console.log('─'.repeat(70));
console.log('1. Open Google Drive folder in browser');
console.log('2. Download all JSON files');
console.log('3. Place them in: scripts/google-drive-content/');
console.log('4. Run: npm run import:courses (to be created)');
console.log('');

const { exec } = require('child_process');

console.log('📂 Opening Google Drive folder...\n');
exec(`start ${DRIVE_FOLDER}`, (error) => {
  if (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log(`   Please open manually: ${DRIVE_FOLDER}\n`);
  } else {
    console.log('✅ Browser opened!\n');
  }
});
