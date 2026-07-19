const axios = require('axios');

async function test() {
  console.log('\n🧪 Testing Simple Course Generation...\n');

  try {
    const response = await axios.post('http://localhost:3013/api/education/courses/generate', {
      subject: 'Accounting',
      level: 'FOUNDATION',
      examType: 'CA_FOUNDATION',
      courseTitle: 'CA Foundation - Accounting',
      modules: [
        {
          title: 'Introduction to Accounting',
          description: 'Learn the basics of accounting',
          topics: ['Accounting Concepts', 'Accounting Conventions', 'Accounting Standards']
        }
      ]
    }, {
      timeout: 60000
    });

    console.log('✅ Course generation successful!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
