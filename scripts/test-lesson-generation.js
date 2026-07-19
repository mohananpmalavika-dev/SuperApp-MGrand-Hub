const axios = require('axios');

async function test() {
  console.log('\n🧪 Testing Lesson Content Generation...\n');

  const courseId = '6a5caa26f5ce74ecaa512ad2'; // From previous test

  try {
    const response = await axios.post(`http://localhost:3013/api/education/courses/${courseId}/generate-lesson`, {
      moduleNumber: 1,
      chapterNumber: 1,
      topic: 'Introduction to Accounting'
    }, {
      timeout: 120000 // 2 minutes for AI generation
    });

    console.log('✅ Lesson generation successful!');
    console.log('\nLesson Details:');
    const lesson = response.data.data;
    console.log('- Title:', lesson.title);
    console.log('- Content length:', lesson.content?.length || 0, 'characters');
    console.log('- Audio URL:', lesson.audioUrl || 'None');
    console.log('- Video URL:', lesson.videoUrl || 'None');
    console.log('- Animations:', lesson.animations?.length || 0);
    console.log('- Questions:', lesson.questions?.length || 0);
    console.log('\nFull response:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 2000) + '...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
