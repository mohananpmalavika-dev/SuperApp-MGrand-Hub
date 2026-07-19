const axios = require('axios');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testSetup() {
  log('\n' + '='.repeat(60), 'bright');
  log('🔍 TESTING SETUP BEFORE GENERATION', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  let allGood = true;

  // Test 1: Backend reachable
  log('1️⃣  Testing Backend Connection...', 'blue');
  try {
    const response = await axios.get('http://localhost:3013/', { timeout: 5000 });
    if (response.data && response.data.service) {
      log('   ✅ Backend is running on port 3013', 'green');
      log(`   📦 Service: ${response.data.service}`, 'green');
    }
  } catch (error) {
    log('   ❌ Backend is NOT running!', 'red');
    log('   ⚠️  Start it with: cd services/education-service && npm start', 'yellow');
    allGood = false;
  }

  // Test 2: API endpoint exists
  log('\n2️⃣  Testing API Endpoints...', 'blue');
  try {
    const response = await axios.get('http://localhost:3013/api/education/courses', { timeout: 5000 });
    log('   ✅ /api/education/courses endpoint working', 'green');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('   ✅ Endpoint exists (auth required - expected)', 'green');
    } else {
      log('   ⚠️  Endpoint status: ' + (error.response?.status || 'unreachable'), 'yellow');
    }
  }

  // Test 3: Check generation endpoint
  log('\n3️⃣  Testing Generation Endpoint...', 'blue');
  try {
    // This will fail without auth, but we just want to know the endpoint exists
    await axios.post('http://localhost:3013/api/education/courses/generate', {}, { timeout: 5000 });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('   ✅ Generation endpoint exists (will need auth token)', 'green');
      log('   💡 Scripts will handle authentication', 'blue');
    } else if (error.response && error.response.status === 400) {
      log('   ✅ Generation endpoint reachable', 'green');
    } else {
      log('   ⚠️  Status: ' + (error.response?.status || 'unknown'), 'yellow');
    }
  }

  log('\n' + '='.repeat(60), 'bright');
  
  if (allGood) {
    log('✅ ALL CHECKS PASSED!', 'green');
    log('='.repeat(60), 'bright');
    log('\n🚀 You\'re ready to generate content!\n', 'green');
    log('Run this command:', 'blue');
    log('   node generate-all-content.js\n', 'bright');
  } else {
    log('⚠️  SOME CHECKS FAILED', 'yellow');
    log('='.repeat(60), 'bright');
    log('\n📋 Fix the issues above, then run:', 'yellow');
    log('   node test-setup.js\n', 'bright');
  }
}

testSetup().catch(err => {
  log('\n❌ Test failed: ' + err.message, 'red');
  process.exit(1);
});
