const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Your public Google Drive folder ID
const DRIVE_FOLDER_ID = '1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Upload file to public Google Drive folder using simple HTTP
 */
async function uploadToPublicDrive(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    log(`⚠️  File not found: ${filePath}`, 'yellow');
    return null;
  }

  try {
    log(`\n📤 Uploading ${fileName} to Google Drive...`, 'cyan');

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Since it's a public folder, we'll use a webhook/form approach
    // Alternative: Use Google Apps Script Web App as a proxy
    
    // For now, let's just copy files locally and provide instructions
    // to manually upload or use Google Drive desktop app
    
    const uploadDir = path.join(__dirname, 'for-drive-upload');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destPath = path.join(uploadDir, fileName);
    fs.copyFileSync(filePath, destPath);

    log(`✅ File prepared: ${destPath}`, 'green');
    log(`📋 Ready to upload to Drive`, 'blue');
    
    return {
      localPath: destPath,
      fileName: fileName,
      size: fs.statSync(destPath).size
    };

  } catch (err) {
    log(`❌ Preparation failed: ${err.message}`, 'red');
    return null;
  }
}

/**
 * Upload all summaries
 */
async function uploadAllSummaries() {
  log('\n' + '='.repeat(60), 'bright');
  log('📤 PREPARING FILES FOR GOOGLE DRIVE', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const summaries = [
    { file: 'generation-summary.json', name: 'ca-foundation-summary.json' },
    { file: 'jee-physics-summary.json', name: 'jee-physics-summary.json' },
    { file: 'cbse-10-summary.json', name: 'cbse-10-summary.json' },
    { file: 'ias-prelims-summary.json', name: 'ias-prelims-summary.json' },
    { file: 'master-summary.json', name: 'master-summary.json' }
  ];

  const prepared = [];

  for (const summary of summaries) {
    const filePath = path.join(__dirname, summary.file);
    if (fs.existsSync(filePath)) {
      const result = await uploadToPublicDrive(filePath, summary.name);
      if (result) {
        prepared.push(result);
      }
    } else {
      log(`⚠️  File not found: ${summary.file}`, 'yellow');
    }
  }

  log('\n' + '='.repeat(60), 'bright');
  log('✅ FILES PREPARED FOR UPLOAD', 'green');
  log('='.repeat(60) + '\n', 'bright');

  if (prepared.length > 0) {
    log('📁 Files ready in: scripts/for-drive-upload/\n');
    
    log('🔗 Upload Methods:', 'cyan');
    log('');
    log('Option 1: Drag and Drop', 'yellow');
    log('   1. Open: https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID);
    log('   2. Drag files from: scripts/for-drive-upload/');
    log('   3. Drop into the Drive folder');
    log('');
    log('Option 2: Google Drive Desktop App', 'yellow');
    log('   1. Install Google Drive for Desktop');
    log('   2. Sync this folder to Drive');
    log('   3. Copy files automatically sync');
    log('');
    log('Option 3: Manual Upload', 'yellow');
    log('   1. Go to Drive folder');
    log('   2. Click "New" → "File upload"');
    log('   3. Select files from for-drive-upload/');
    log('');

    log('📊 Prepared Files:', 'blue');
    prepared.forEach(file => {
      log(`   ✓ ${file.fileName} (${(file.size / 1024).toFixed(1)} KB)`);
    });
    log('');
  }

  log('🔗 Google Drive Folder:');
  log('   https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID + '\n');

  return prepared;
}

// Run if called directly
if (require.main === module) {
  uploadAllSummaries()
    .then(files => {
      if (files.length > 0) {
        log('✅ All files prepared successfully!\n', 'green');
      } else {
        log('⚠️  No files to upload\n', 'yellow');
      }
    })
    .catch(err => {
      log(`\n❌ Error: ${err.message}\n`, 'red');
      process.exit(1);
    });
}

module.exports = { uploadToPublicDrive, uploadAllSummaries };
