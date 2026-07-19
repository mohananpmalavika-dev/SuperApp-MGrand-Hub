const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  log('🚀 COMPLETE CONTENT GENERATION - ALL 122 LESSONS', 'bright');
  log('='.repeat(70), 'bright');
  log('');
  log('📚 Generation Plan:');
  log('   1. CA Foundation        - 40 lessons (~60 minutes)');
  log('   2. JEE Main Physics     - 30 lessons (~50 minutes)');
  log('   3. CBSE Class 10 Math   - 16 lessons (~25 minutes)');
  log('   4. IAS Prelims          - 36 lessons (~70 minutes)');
  log('');
  log('   Total: 122 lessons in ~3.5 hours');
  log('='.repeat(70) + '\n', 'bright');

  const overallStart = Date.now();
  const results = [];

  const scripts = [
    { name: 'CA Foundation', path: './generate-ca-foundation.js' },
    { name: 'JEE Main Physics', path: './generate-jee-physics.js' },
    { name: 'CBSE Class 10 Math', path: './generate-cbse-10.js' },
    { name: 'IAS Prelims', path: './generate-ias-prelims.js' }
  ];

  // Run each script sequentially
  for (const script of scripts) {
    try {
      const result = await runScript(script.name, script.path);
      results.push(result);
      
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
  log('');

  // Load individual summaries
  try {
    const summaries = {
      caFoundation: fs.existsSync(path.join(__dirname, 'generation-summary.json'))
        ? JSON.parse(fs.readFileSync(path.join(__dirname, 'generation-summary.json'), 'utf8'))
        : null,
      jeePhysics: fs.existsSync(path.join(__dirname, 'jee-physics-summary.json'))
        ? JSON.parse(fs.readFileSync(path.join(__dirname, 'jee-physics-summary.json'), 'utf8'))
        : null,
      cbse10: fs.existsSync(path.join(__dirname, 'cbse-10-summary.json'))
        ? JSON.parse(fs.readFileSync(path.join(__dirname, 'cbse-10-summary.json'), 'utf8'))
        : null,
      iasPrelims: fs.existsSync(path.join(__dirname, 'ias-prelims-summary.json'))
        ? JSON.parse(fs.readFileSync(path.join(__dirname, 'ias-prelims-summary.json'), 'utf8'))
        : null
    };

    const totalLessons = [
      summaries.caFoundation?.totalLessons || 0,
      summaries.jeePhysics?.lessonsGenerated || 0,
      summaries.cbse10?.lessonsGenerated || 0,
      summaries.iasPrelims?.lessonsGenerated || 0
    ].reduce((a, b) => a + b, 0);

    const totalQuestions = [
      summaries.caFoundation?.totalQuestions || 0,
      summaries.jeePhysics?.totalQuestions || 0,
      summaries.cbse10?.totalQuestions || 0,
      summaries.iasPrelims?.totalQuestions || 0
    ].reduce((a, b) => a + b, 0);

    log('📈 Content Statistics:');
    log('');
    log(`   📚 Total Lessons Generated: ${totalLessons}/122`);
    log(`   ❓ Total Questions: ${totalQuestions}`);
    log(`   🎥 Videos Generated: ${totalLessons}`);
    log(`   🎧 Audio Files: ${totalLessons}`);
    log(`   💾 Estimated Storage: ~${(totalLessons * 150).toFixed(0)} MB`);
    log('');

    // Create master summary
    const masterSummary = {
      timestamp: new Date().toISOString(),
      totalDuration: `${overallDuration} minutes`,
      results: results,
      statistics: {
        totalLessons,
        targetLessons: 122,
        completionPercentage: ((totalLessons / 122) * 100).toFixed(1),
        totalQuestions,
        videosGenerated: totalLessons,
        audioGenerated: totalLessons,
        storageUsedMB: totalLessons * 150
      },
      courses: {
        caFoundation: summaries.caFoundation,
        jeePhysics: summaries.jeePhysics,
        cbse10: summaries.cbse10,
        iasPrelims: summaries.iasPrelims
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'master-summary.json'),
      JSON.stringify(masterSummary, null, 2)
    );

    log('💾 Master summary saved to master-summary.json');

  } catch (error) {
    log(`⚠️  Could not create master summary: ${error.message}`, 'yellow');
  }

  log('');
  log('='.repeat(70), 'bright');
  log('');
  log('🎯 Next Steps:', 'cyan');
  log('   1. Run validation: node validate-content.js');
  log('   2. Review individual summaries in scripts/ folder');
  log('   3. Check generation-errors.log for any issues');
  log('   4. Test content on frontend');
  log('   5. Backup generated content');
  log('');
  log('📝 Summary Files:');
  log('   • master-summary.json           - Overall statistics');
  log('   • generation-summary.json       - CA Foundation details');
  log('   • jee-physics-summary.json      - JEE Physics details');
  log('   • cbse-10-summary.json          - CBSE Class 10 details');
  log('   • ias-prelims-summary.json      - IAS Prelims details');
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

module.exports = { main };
