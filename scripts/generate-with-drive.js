const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { authorize, uploadFile, DRIVE_FOLDER_ID } = require('./setup-google-drive');

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Upload summary file to Google Drive
 */
async function uploadSummary(auth, summaryFile, courseName) {
  if (!fs.existsSync(summaryFile)) {
    log(`⚠️  Summary file not found: ${summaryFile}`, 'yellow');
    return null;
  }

  try {
    // Load drive folders
    const foldersPath = path.join(__dirname, 'drive-folders.json');
    let folderId = DRIVE_FOLDER_ID;

    if (fs.existsSync(foldersPath)) {
      const folders = JSON.parse(fs.readFileSync(foldersPath));
      folderId = folders['summaries'] || DRIVE_FOLDER_ID;
    }

    log(`\n📤 Uploading ${path.basename(summaryFile)} to Google Drive...`, 'cyan');
    
    const file = await uploadFile(
      auth, 
      summaryFile, 
      `${courseName}-summary-${new Date().toISOString().split('T')[0]}.json`,
      folderId
    );

    log(`✅ Uploaded: ${file.name}`, 'green');
    log(`🔗 Link: ${file.webViewLink}`, 'blue');
    
    return file;
  } catch (err) {
    log(`❌ Upload failed: ${err.message}`, 'red');
    return null;
  }
}

/**
 * Run generation script
 */
function runScript(scriptName, scriptPath) {
  return new Promise((resolve, reject) => {
    log(`\n${'='.repeat(70)}`, 'bright');
    log(`▶️  Starting: ${scriptName}`, 'bright');
    log('='.repeat(70) + '\n', 'bright');

    const startTime = Date.now();
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname
    });

    child.on('close', (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000 / 60);
      
      if (code === 0) {
        log(`\n✅ ${scriptName} completed in ${duration} minutes\n`, 'green');
        resolve({ name: scriptName, duration, success: true });
      } else {
        log(`\n❌ ${scriptName} failed with code ${code}\n`, 'red');
        resolve({ name: scriptName, duration, success: false, code });
      }
    });

    child.on('error', (error) => {
      log(`\n❌ Error running ${scriptName}: ${error.message}\n`, 'red');
      reject(error);
    });
  });
}

async function main() {
  log('\n' + '='.repeat(70), 'bright');
  log('🚀 CONTENT GENERATION WITH GOOGLE DRIVE SYNC', 'bright');
  log('='.repeat(70), 'bright');
  log('');
  log('📚 Generation Plan:');
  log('   1. CA Foundation        - 40 lessons (~60 minutes)');
  log('   2. JEE Main Physics     - 30 lessons (~50 minutes)');
  log('   3. CBSE Class 10 Math   - 16 lessons (~25 minutes)');
  log('   4. IAS Prelims          - 36 lessons (~70 minutes)');
  log('');
  log('   After each course: Auto-upload summary to Google Drive');
  log('   Total: 122 lessons in ~3.5 hours');
  log('='.repeat(70) + '\n', 'bright');

  // Authorize with Google Drive
  let auth;
  try {
    log('🔐 Connecting to Google Drive...', 'blue');
    auth = await authorize();
    log('✅ Connected to Google Drive!\n', 'green');
  } catch (err) {
    log('❌ Google Drive connection failed!', 'red');
    log('⚠️  Will continue without Drive sync.\n', 'yellow');
    log('Run "node setup-google-drive.js" to set up Drive integration.\n');
  }

  const overallStart = Date.now();
  const results = [];
  const uploadedFiles = [];

  const scripts = [
    { 
      name: 'CA Foundation', 
      path: './generate-ca-foundation.js',
      summaryFile: 'generation-summary.json'
    },
    { 
      name: 'JEE Main Physics', 
      path: './generate-jee-physics.js',
      summaryFile: 'jee-physics-summary.json'
    },
    { 
      name: 'CBSE Class 10 Math', 
      path: './generate-cbse-10.js',
      summaryFile: 'cbse-10-summary.json'
    },
    { 
      name: 'IAS Prelims', 
      path: './generate-ias-prelims.js',
      summaryFile: 'ias-prelims-summary.json'
    }
  ];

  // Run each script sequentially
  for (const script of scripts) {
    try {
      const result = await runScript(script.name, script.path);
      results.push(result);
      
      // Upload summary to Google Drive if connected
      if (auth && result.success) {
        const file = await uploadSummary(
          auth, 
          path.join(__dirname, script.summaryFile),
          script.name
        );
        if (file) {
          uploadedFiles.push(file);
        }
      }
      
      // Cool down between major generations
      if (script !== scripts[scripts.length - 1]) {
        log('⏸️  Cooling down for 2 minutes between courses...\n', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 120000));
      }
    } catch (error) {
      log(`❌ Fatal error in ${script.name}: ${error.message}`, 'red');
      results.push({ name: script.name, success: false, error: error.message });
    }
  }

  const overallDuration = Math.round((Date.now() - overallStart) / 1000 / 60);

  // Create master summary
  const masterSummary = {
    timestamp: new Date().toISOString(),
    totalDuration: `${overallDuration} minutes`,
    results: results,
    uploadedToGoogleDrive: uploadedFiles.length > 0,
    driveFiles: uploadedFiles
  };

  fs.writeFileSync(
    path.join(__dirname, 'master-summary.json'),
    JSON.stringify(masterSummary, null, 2)
  );

  // Upload master summary to Google Drive
  if (auth) {
    await uploadSummary(auth, path.join(__dirname, 'master-summary.json'), 'Master');
  }

  // Final Summary
  log('\n' + '='.repeat(70), 'bright');
  log('🎊 CONTENT GENERATION COMPLETE!', 'bright');
  log('='.repeat(70), 'bright');
  log('');
  log('📊 Results Summary:');
  log('');

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`   ${status} ${result.name.padEnd(25)} - ${result.duration || 0} min`, color);
  });

  log('');
  log(`⏱️  Total Time: ${overallDuration} minutes (${(overallDuration / 60).toFixed(1)} hours)`);
  log(`✅ Successful: ${results.filter(r => r.success).length}/${results.length}`);
  log(`❌ Failed: ${results.filter(r => !r.success).length}/${results.length}`);
  
  if (uploadedFiles.length > 0) {
    log(`\n📤 Google Drive Uploads: ${uploadedFiles.length}`, 'cyan');
    log('🔗 View files: https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID, 'blue');
  }

  log('');
  log('='.repeat(70), 'bright');
  log('');
  log('🎯 Next Steps:', 'cyan');
  log('   1. Check Google Drive folder for summaries');
  log('   2. Run validation: node validate-content.js');
  log('   3. Review content quality');
  log('   4. Test on frontend');
  log('');
  log('📁 Google Drive Folder:');
  log('   https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID);
  log('');
  log('='.repeat(70), 'bright');
  log('');

  if (results.every(r => r.success)) {
    log('🎉 ALL CONTENT GENERATION SUCCESSFUL! 🎉\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some generations failed. Check logs above.\n', 'yellow');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  });
}
