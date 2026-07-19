const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Your public Google Drive folder
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';
const SCRIPTS_DIR = __dirname;

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function openUrl(url) {
  const command = process.platform === 'win32' ? 'start' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${command} "${url}"`);
}

function openFolder(folderPath) {
  const command = process.platform === 'win32' ? 'explorer' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${command} "${folderPath}"`);
}

function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('📤 OPEN SUMMARIES FOR UPLOAD', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  // Find all summary files
  const summaryFiles = [
    'generation-summary.json',
    'jee-physics-summary.json',
    'cbse-10-summary.json',
    'ias-prelims-summary.json',
    'master-summary.json'
  ];

  const existingFiles = summaryFiles.filter(file => 
    fs.existsSync(path.join(SCRIPTS_DIR, file))
  );

  if (existingFiles.length === 0) {
    log('⚠️  No summary files found!', 'yellow');
    log('\nRun content generation first:', 'yellow');
    log('   node generate-all-content.js\n');
    process.exit(1);
  }

  log('📁 Found Summary Files:', 'green');
  existingFiles.forEach(file => {
    const filePath = path.join(SCRIPTS_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    log(`   ✓ ${file.padEnd(35)} (${sizeKB} KB)`);
  });

  log('\n🚀 Opening...', 'cyan');
  log('   1. Google Drive folder in browser');
  log('   2. Scripts folder in File Explorer');
  log('');

  // Open Drive folder in browser
  setTimeout(() => {
    log('🌐 Opening Drive folder...', 'blue');
    openUrl(DRIVE_FOLDER_URL);
  }, 500);

  // Open scripts folder in explorer
  setTimeout(() => {
    log('📂 Opening scripts folder...', 'blue');
    openFolder(SCRIPTS_DIR);
  }, 1500);

  setTimeout(() => {
    log('\n' + '='.repeat(60), 'bright');
    log('✅ READY TO UPLOAD!', 'green');
    log('='.repeat(60) + '\n', 'bright');

    log('📋 Next Steps:', 'cyan');
    log('   1. Browser opened: Google Drive folder');
    log('   2. Explorer opened: Scripts folder with summaries');
    log('   3. Drag these files from Explorer to Drive:');
    log('');
    
    existingFiles.forEach(file => {
      log(`      → ${file}`, 'yellow');
    });

    log('');
    log('💡 Tips:', 'blue');
    log('   • Hold Ctrl and click all files to select them');
    log('   • Drag together to Drive browser window');
    log('   • Drop when you see "Upload" indicator');
    log('   • Upload completes in 1-2 seconds');
    log('');
    log('🔗 Drive Folder:');
    log('   ' + DRIVE_FOLDER_URL);
    log('');
    log('='.repeat(60) + '\n', 'bright');
  }, 3000);
}

if (require.main === module) {
  main();
}
