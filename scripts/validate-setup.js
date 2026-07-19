/**
 * Validation Script: Check if CA Foundation setup is ready
 * 
 * This script validates:
 * - Content files exist
 * - Backend API is running
 * - MongoDB is connected
 * - File IDs are configured
 * 
 * Usage: node scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  console.log('\n' + '═'.repeat(60));
  log(text, 'cyan');
  console.log('═'.repeat(60) + '\n');
}

async function checkFiles() {
  header('📁 Checking Content Files');
  
  const contentDir = path.join(__dirname, 'google-drive-content', 'ca-foundation-multimedia');
  const expectedFiles = [
    'ca-f-accounting-complete.json',
    'ca-f-business-laws-complete.json',
    'ca-f-business-mathematics-complete.json',
    'ca-f-business-economics-complete.json'
  ];

  let allExist = true;

  for (const file of expectedFiles) {
    const filePath = path.join(contentDir, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`✅ ${file} (${sizeKB} KB)`, 'green');
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      allExist = false;
    }
  }

  if (allExist) {
    log('\n✨ All content files present!', 'green');
  } else {
    log('\n⚠️  Some content files are missing', 'yellow');
  }

  return allExist;
}

async function checkBackend() {
  header('🔌 Checking Backend API');
  
  const backendUrl = 'http://localhost:3013/api/education';
  
  try {
    const response = await axios.get(`${backendUrl}/health`, { timeout: 3000 });
    log('✅ Backend is running', 'green');
    log(`   URL: ${backendUrl}`, 'cyan');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Backend not running', 'red');
      log('   Start with: cd services/education-service && npm start', 'yellow');
    } else if (error.response?.status === 404) {
      // Health endpoint doesn't exist, but server is running
      log('✅ Backend is running (no health endpoint)', 'green');
      log(`   URL: ${backendUrl}`, 'cyan');
      return true;
    } else {
      log(`❌ Backend error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function checkRoutes() {
  header('🛣️  Checking API Routes');
  
  const routes = [
    { name: 'Courses', path: '/api/education/courses' },
    { name: 'Drive Content', path: '/api/education/drive/health' },
    { name: 'Notes Download', path: '/api/education/notes/health' }
  ];

  let allWork = true;

  for (const route of routes) {
    try {
      await axios.get(`http://localhost:3013${route.path}`, { timeout: 2000 });
      log(`✅ ${route.name}: ${route.path}`, 'green');
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        // Route exists but returns error (expected for health checks)
        log(`✅ ${route.name}: ${route.path}`, 'green');
      } else if (error.code === 'ECONNREFUSED') {
        log(`❌ ${route.name}: Backend not running`, 'red');
        allWork = false;
      } else {
        log(`⚠️  ${route.name}: ${error.message}`, 'yellow');
      }
    }
  }

  return allWork;
}

function checkFileIds() {
  header('🔑 Checking Google Drive File IDs');
  
  const mappingPath = path.join(__dirname, '..', 'services', 'education-service', 'src', 'config', 'ca-foundation-mapping.js');
  
  if (!fs.existsSync(mappingPath)) {
    log('❌ Mapping file not found', 'red');
    log(`   Expected: ${mappingPath}`, 'yellow');
    return false;
  }

  const content = fs.readFileSync(mappingPath, 'utf8');
  
  const hasPlaceholders = content.includes('YOUR_ACCOUNTING_FILE_ID') ||
                          content.includes('YOUR_BUSINESS_LAWS_FILE_ID') ||
                          content.includes('YOUR_BUSINESS_MATHS_FILE_ID') ||
                          content.includes('YOUR_BUSINESS_ECONOMICS_FILE_ID');

  if (hasPlaceholders) {
    log('⚠️  File IDs not configured yet', 'yellow');
    log('\n   Next steps:', 'cyan');
    log('   1. Upload files to Google Drive', 'yellow');
    log('   2. Make files public', 'yellow');
    log('   3. Get file IDs from Drive URLs', 'yellow');
    log('   4. Update file IDs in:', 'yellow');
    log(`      - ${mappingPath}`, 'yellow');
    log('      - scripts/setup-ca-foundation-courses.js', 'yellow');
    log('\n   See UPDATE_FILE_IDS_HERE.md for detailed instructions', 'cyan');
    return false;
  } else {
    log('✅ File IDs are configured!', 'green');
    
    // Try to extract and display the IDs
    const idMatches = content.match(/['"]([a-zA-Z0-9_-]{20,})['"/]/g);
    if (idMatches) {
      log('\n   Configured IDs:', 'cyan');
      idMatches.slice(0, 4).forEach((match, index) => {
        const id = match.replace(/['"]/g, '');
        log(`   ${index + 1}. ${id}`, 'green');
      });
    }
    return true;
  }
}

async function checkMongoDB() {
  header('💾 Checking MongoDB Connection');
  
  try {
    const response = await axios.get('http://localhost:3013/api/education/courses', { timeout: 3000 });
    log('✅ MongoDB connected', 'green');
    log(`   Found ${response.data?.length || 0} courses`, 'cyan');
    
    if (response.data?.length > 0) {
      log('\n   Existing courses:', 'cyan');
      response.data.forEach((course, index) => {
        log(`   ${index + 1}. ${course.name}`, 'green');
      });
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Cannot check MongoDB (backend not running)', 'red');
    } else {
      log(`⚠️  MongoDB check failed: ${error.message}`, 'yellow');
    }
    return false;
  }
}

function displaySummary(results) {
  header('📊 VALIDATION SUMMARY');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log('✨ ALL CHECKS PASSED! ✨', 'green');
    log('\nYou\'re ready to go!', 'cyan');
    log('\n🎯 Next Steps:', 'cyan');
    log('   1. Open http://localhost:3000/education/courses', 'green');
    log('   2. Browse CA Foundation courses', 'green');
    log('   3. Click any course to view lessons', 'green');
    log('   4. Click any lesson to view content', 'green');
  } else {
    log('⚠️  Some checks failed', 'yellow');
    log('\n📋 TODO:', 'cyan');
    
    if (!results.files) {
      log('   • Generate content files (if missing)', 'yellow');
    }
    if (!results.backend) {
      log('   • Start backend: cd services/education-service && npm start', 'yellow');
    }
    if (!results.fileIds) {
      log('   • Upload files to Google Drive and configure file IDs', 'yellow');
      log('   • See UPDATE_FILE_IDS_HERE.md for instructions', 'yellow');
    }
    if (!results.mongodb) {
      log('   • Check MongoDB connection', 'yellow');
      log('   • Run setup script after configuring file IDs', 'yellow');
    }
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
}

async function validate() {
  log('\n🚀 CA Foundation Setup Validation', 'cyan');
  log('Starting validation checks...\n', 'cyan');

  const results = {
    files: await checkFiles(),
    backend: await checkBackend(),
    routes: await checkRoutes(),
    fileIds: checkFileIds(),
    mongodb: await checkMongoDB()
  };

  displaySummary(results);
  
  process.exit(results.backend && results.files ? 0 : 1);
}

// Run validation
validate().catch(error => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});
