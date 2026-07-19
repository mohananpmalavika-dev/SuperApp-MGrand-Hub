const axios = require('axios');

/**
 * Quick test to verify content generation is working
 */

const API_BASE = 'http://localhost:3013/api/education';

async function testGeneration() {
  console.log('\n🧪 Testing Content Generation...\n');

  try {
    // Test 1: Check if API is reachable
    console.log('1. Testing API health...');
    const healthResponse = await axios.get('http://localhost:3013/', { timeout: 5000 });
    console.log('✅ Backend is running!');
    console.log('   Version:', healthResponse.data.version);
    console.log('   Status:', healthResponse.data.status);

    // Test 2: Try to generate a simple lesson (without auth for now)
    console.log('\n2. Testing lesson generation...');
    console.log('   Note: This may fail if authentication is required');
    
    try {
      const lessonResponse = await axios.post(`${API_BASE}/courses/generate`, {
        subject: 'Accounting',
        level: 'Foundation',
        title: 'Test Lesson - Introduction to Accounting',
        description: 'A test lesson to verify generation is working',
        duration: '15-20 minutes'
      }, {
        timeout: 60000 // 1 minute timeout
      });

      console.log('✅ Lesson generation successful!');
      console.log('   Response:', JSON.stringify(lessonResponse.data, null, 2).substring(0, 500) + '...');
    } catch (genError) {
      if (genError.response && genError.response.status === 401) {
        console.log('⚠️  Authentication required for generation');
        console.log('   This is normal - generation endpoints are protected');
        console.log('   We\'ll need to handle auth in the generation script');
      } else {
        console.error('❌ Generation failed:', genError.message);
        if (genError.response) {
          console.error('   Status:', genError.response.status);
          console.error('   Error:', genError.response.data);
        }
      }
    }

    console.log('\n✅ Backend test complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. If auth is required, we need to either:');
    console.log('      a) Disable auth for localhost (development)');
    console.log('      b) Generate a JWT token for the scripts');
    console.log('   2. Then run the full generation: npm run generate:drive');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Backend is not running!');
      console.error('   Please start it: cd services/education-service && npm start');
    }
  }
}

testGeneration();
