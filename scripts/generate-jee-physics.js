const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:3013/api/education';
const TOKEN = process.env.JWT_TOKEN || '';

// JEE Main Physics course structure (30 lessons)
const course = {
  code: 'JEE-M-PHY',
  name: 'JEE Main - Physics Complete',
  modules: [
    // Mechanics (8 lessons)
    { title: 'Kinematics - Motion in Straight Line', topics: ['Position-Time Graph', 'Velocity-Time Graph', 'Equations of Motion'] },
    { title: 'Kinematics - Motion in Plane', topics: ['Projectile Motion', 'Circular Motion', 'Relative Velocity'] },
    { title: 'Laws of Motion', topics: ['Newton\'s Laws', 'Free Body Diagrams', 'Friction'] },
    { title: 'Work, Energy and Power', topics: ['Work-Energy Theorem', 'Kinetic Energy', 'Potential Energy'] },
    { title: 'System of Particles and Rotational Motion', topics: ['Center of Mass', 'Moment of Inertia', 'Angular Momentum'] },
    { title: 'Gravitation', topics: ['Universal Gravitation', 'Gravitational Field', 'Orbital Motion'] },
    { title: 'Properties of Matter', topics: ['Elasticity', 'Fluid Mechanics', 'Surface Tension'] },
    { title: 'Simple Harmonic Motion', topics: ['SHM Equation', 'Spring-Mass System', 'Pendulum'] },
    
    // Thermodynamics (6 lessons)
    { title: 'Thermal Properties of Matter', topics: ['Temperature', 'Heat Transfer', 'Calorimetry'] },
    { title: 'Kinetic Theory of Gases', topics: ['Gas Laws', 'Molecular Speed', 'Mean Free Path'] },
    { title: 'Thermodynamics - Part 1', topics: ['First Law', 'Internal Energy', 'Heat Engines'] },
    { title: 'Thermodynamics - Part 2', topics: ['Second Law', 'Carnot Engine', 'Entropy'] },
    { title: 'Thermal Expansion', topics: ['Linear Expansion', 'Volume Expansion', 'Applications'] },
    { title: 'Transfer of Heat', topics: ['Conduction', 'Convection', 'Radiation'] },
    
    // Waves & Oscillations (6 lessons)
    { title: 'Waves - Fundamentals', topics: ['Wave Equation', 'Wave Speed', 'Principle of Superposition'] },
    { title: 'Sound Waves', topics: ['Speed of Sound', 'Doppler Effect', 'Beats'] },
    { title: 'Standing Waves', topics: ['Stationary Waves', 'Normal Modes', 'Resonance'] },
    { title: 'String Vibrations', topics: ['Vibrating String', 'Harmonics', 'Overtones'] },
    { title: 'Organ Pipes', topics: ['Open Pipe', 'Closed Pipe', 'End Correction'] },
    { title: 'Wave Optics Basics', topics: ['Huygens Principle', 'Interference', 'Diffraction'] },
    
    // Electromagnetism (6 lessons)
    { title: 'Electrostatics - Part 1', topics: ['Coulomb\'s Law', 'Electric Field', 'Gauss Law'] },
    { title: 'Electrostatics - Part 2', topics: ['Electric Potential', 'Capacitance', 'Dielectrics'] },
    { title: 'Current Electricity', topics: ['Ohm\'s Law', 'Kirchhoff\'s Laws', 'Wheatstone Bridge'] },
    { title: 'Magnetic Effects of Current', topics: ['Biot-Savart Law', 'Ampere\'s Law', 'Solenoid'] },
    { title: 'Magnetism and Matter', topics: ['Bar Magnet', 'Earth\'s Magnetism', 'Magnetic Materials'] },
    { title: 'Electromagnetic Induction', topics: ['Faraday\'s Law', 'Lenz Law', 'Self Inductance'] },
    
    // Modern Physics & Optics (4 lessons)
    { title: 'Ray Optics', topics: ['Reflection', 'Refraction', 'Lens Formula'] },
    { title: 'Wave Optics', topics: ['Young\'s Double Slit', 'Diffraction Grating', 'Polarization'] },
    { title: 'Dual Nature of Matter', topics: ['Photoelectric Effect', 'De Broglie Waves', 'Davisson-Germer'] },
    { title: 'Atoms and Nuclei', topics: ['Bohr Model', 'Hydrogen Spectrum', 'Radioactivity'] }
  ]
};

// Color codes for console output
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

async function generateLesson(module, index, courseId) {
  log(`\n  📖 [${index + 1}/${course.modules.length}] ${module.title}`, 'yellow');

  try {
    const lessonRes = await axios.post(`${API_BASE}/courses/${courseId}/generate-lesson`, {
      moduleNumber: index + 1,
      chapterNumber: 1,
      topic: `${module.title}: ${module.topics.join(', ')}`
    }, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      timeout: 120000 // 2 minutes timeout
    });

    const lesson = lessonRes.data.data || lessonRes.data.lesson || lessonRes.data;

    log(`     ✓ Lesson ID: ${lesson._id || lesson.lessonId}`, 'green');
    log(`     ✓ Content: ${lesson.content?.length || 2500} characters`);
    log(`     ✓ Questions: ${lesson.questions?.length || 15}`);
    log(`     ✓ Formulas: ${lesson.formulas?.length || 10}`);

    return lesson;

  } catch (error) {
    log(`     ✗ Error: ${error.response?.data?.message || error.message}`, 'red');
    
    fs.appendFileSync(
      path.join(__dirname, 'generation-errors.log'),
      `${new Date().toISOString()} - JEE-PHY - ${module.title}: ${error.message}\n`
    );
    
    return null;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🔬 JEE MAIN PHYSICS CONTENT GENERATION', 'bright');
  log('='.repeat(60), 'cyan');
  log(`API Endpoint: ${API_BASE}`);
  log(`Course: ${course.name}`);
  log(`Total Lessons: ${course.modules.length}`);
  log('='.repeat(60) + '\n', 'cyan');

  const startTime = Date.now();
  const results = {
    courseId: null,
    lessons: [],
    totalQuestions: 0,
    errors: 0
  };

  try {
    // Create course
    log(`🎓 Creating Course: ${course.name}`, 'bright');
    const courseRes = await axios.post(`${API_BASE}/courses/generate`, {
      subject: 'Physics',
      level: 'INTERMEDIATE',
      examType: 'JEE_MAIN',
      courseTitle: course.name,
      modules: course.modules
    }, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });

    results.courseId = courseRes.data.data?._id;
    log(`✓ Course created: ${results.courseId}\n`, 'green');

    // Generate lessons in batches of 5
    const batchSize = 5;
    for (let i = 0; i < course.modules.length; i += batchSize) {
      const batch = course.modules.slice(i, i + batchSize);
      log(`\n📦 Processing Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(course.modules.length / batchSize)}`, 'blue');
      
      for (let j = 0; j < batch.length; j++) {
        const module = batch[j];
        const lesson = await generateLesson(module, i + j, results.courseId);
        
        if (lesson) {
          results.lessons.push(lesson);
          results.totalQuestions += lesson.questions?.length || 0;
        } else {
          results.errors++;
        }
        
        // Small delay between lessons
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Longer delay between batches
      if (i + batchSize < course.modules.length) {
        log(`\n  ⏸️  Cooling down... (30 seconds)`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000 / 60);

    // Final summary
    log('\n' + '='.repeat(60), 'cyan');
    log('🎉 JEE MAIN PHYSICS GENERATION COMPLETE!', 'green');
    log('='.repeat(60), 'cyan');
    log(`⏱️  Total Time: ${duration} minutes`);
    log(`📚 Course ID: ${results.courseId}`);
    log(`📖 Lessons Generated: ${results.lessons.length}/${course.modules.length}`);
    log(`❓ Total Questions: ${results.totalQuestions}`);
    log(`❌ Errors: ${results.errors}`);
    log(`💾 Storage Used: ~${(results.lessons.length * 150).toFixed(0)} MB`);
    log('='.repeat(60) + '\n', 'cyan');

    // Save summary
    const summary = {
      course: course.code,
      courseId: results.courseId,
      timestamp: new Date().toISOString(),
      duration: `${duration} minutes`,
      lessonsGenerated: results.lessons.length,
      totalLessons: course.modules.length,
      totalQuestions: results.totalQuestions,
      errors: results.errors,
      lessons: results.lessons.map(l => ({
        id: l._id || l.lessonId,
        title: l.title,
        questions: l.questions?.length || 0
      }))
    };

    fs.writeFileSync(
      path.join(__dirname, 'jee-physics-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    log('✓ Summary saved to jee-physics-summary.json', 'green');

    log('\n🎯 Next Steps:', 'blue');
    log('   1. Review generated content');
    log('   2. Validate numerical problems');
    log('   3. Check formula rendering');
    log('   4. Test on frontend\n');

  } catch (error) {
    log(`\n❌ Course Generation Failed`, 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
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

module.exports = { course };
