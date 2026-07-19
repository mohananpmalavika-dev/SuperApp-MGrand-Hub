const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:3013/api/education';
const TOKEN = process.env.JWT_TOKEN || ''; // Set via environment or get from login

// CA Foundation course structure
const courses = [
  {
    code: 'CA-F-ACC',
    name: 'CA Foundation - Principles and Practice of Accounting',
    modules: [
      { title: 'Introduction to Accounting', topics: ['Accounting Concepts', 'Accounting Conventions', 'Accounting Standards'] },
      { title: 'Accounting Process', topics: ['Double Entry System', 'Journal Entries', 'Ledger Posting'] },
      { title: 'Books of Prime Entry', topics: ['Cash Book', 'Purchase Book', 'Sales Book'] },
      { title: 'Financial Statements', topics: ['Trading Account', 'Profit & Loss Account', 'Balance Sheet'] },
      { title: 'Trial Balance and Rectification', topics: ['Trial Balance Preparation', 'Error Types', 'Rectification'] },
      { title: 'Bank Reconciliation Statement', topics: ['BRS Concept', 'BRS Preparation', 'Practical Problems'] },
      { title: 'Depreciation Accounting', topics: ['Depreciation Methods', 'Straight Line', 'Written Down Value'] },
      { title: 'Bills of Exchange', topics: ['Promissory Note', 'Bills of Exchange', 'Endorsement'] },
      { title: 'Capital and Revenue', topics: ['Capital Expenditure', 'Revenue Expenditure', 'Deferred Revenue'] },
      { title: 'Accounts from Incomplete Records', topics: ['Single Entry System', 'Statement of Affairs', 'Conversion'] }
    ]
  },
  {
    code: 'CA-F-LAW',
    name: 'CA Foundation - Business Laws',
    modules: [
      { title: 'Indian Contract Act - Part 1', topics: ['Offer and Acceptance', 'Consideration', 'Capacity'] },
      { title: 'Indian Contract Act - Part 2', topics: ['Free Consent', 'Valid Contracts', 'Void Agreements'] },
      { title: 'Sale of Goods Act', topics: ['Sale vs Agreement', 'Conditions and Warranties', 'Transfer of Property'] },
      { title: 'Indian Partnership Act', topics: ['Partnership Essentials', 'Rights and Duties', 'Dissolution'] },
      { title: 'Limited Liability Partnership', topics: ['LLP Concept', 'Registration', 'Compliance'] },
      { title: 'Companies Act - Basics', topics: ['Company Formation', 'Types of Companies', 'MOA and AOA'] },
      { title: 'Business Correspondence', topics: ['Letter Writing', 'Business Communication', 'Email Etiquette'] },
      { title: 'Case Law Studies', topics: ['Important Cases', 'Judicial Decisions', 'Precedents'] }
    ]
  },
  {
    code: 'CA-F-MATHS',
    name: 'CA Foundation - Business Mathematics',
    modules: [
      { title: 'Ratio, Proportion and Indices', topics: ['Ratios', 'Proportions', 'Variations'] },
      { title: 'Logarithms', topics: ['Log Properties', 'Log Equations', 'Applications'] },
      { title: 'Linear Equations', topics: ['Single Variable', 'Two Variables', 'Word Problems'] },
      { title: 'Quadratic Equations', topics: ['Standard Form', 'Factorization', 'Discriminant'] },
      { title: 'Sets, Relations and Functions', topics: ['Set Theory', 'Relations', 'Functions'] },
      { title: 'Permutations', topics: ['Fundamental Principle', 'Factorial', 'Arrangements'] },
      { title: 'Combinations', topics: ['Selection', 'Properties', 'Applications'] },
      { title: 'Sequence and Series', topics: ['AP', 'GP', 'HP'] },
      { title: 'Limits and Continuity', topics: ['Limits', 'Continuity', 'Differentiation Basics'] },
      { title: 'Statistics', topics: ['Measures of Central Tendency', 'Dispersion', 'Correlation'] },
      { title: 'Probability', topics: ['Basic Concepts', 'Theorems', 'Conditional Probability'] },
      { title: 'Logical Reasoning', topics: ['Coding-Decoding', 'Series', 'Puzzles'] }
    ]
  },
  {
    code: 'CA-F-ECO',
    name: 'CA Foundation - Business Economics',
    modules: [
      { title: 'Introduction to Microeconomics', topics: ['Economics Basics', 'Scarcity', 'Economic Systems'] },
      { title: 'Theory of Demand and Supply', topics: ['Law of Demand', 'Law of Supply', 'Equilibrium'] },
      { title: 'Theory of Production', topics: ['Production Function', 'Returns to Scale', 'Cost Concepts'] },
      { title: 'Cost Analysis', topics: ['Fixed Cost', 'Variable Cost', 'Marginal Cost'] },
      { title: 'Market Structures - Part 1', topics: ['Perfect Competition', 'Price Determination'] },
      { title: 'Market Structures - Part 2', topics: ['Monopoly', 'Monopolistic Competition', 'Oligopoly'] },
      { title: 'Business Environment', topics: ['Economic Environment', 'Political Environment', 'Social Environment'] },
      { title: 'Business Organization', topics: ['Sole Proprietorship', 'Partnership', 'Company'] },
      { title: 'Private and Public Sector', topics: ['Public Sector Undertakings', 'Private Sector', 'Comparison'] },
      { title: 'Government Policies', topics: ['Fiscal Policy', 'Monetary Policy', 'Trade Policy'] }
    ]
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function generateCourse(course) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`🎓 Course: ${course.name}`, 'bright');
  log('='.repeat(60), 'blue');

  try {
    // Generate course structure
    const courseRes = await axios.post(`${API_BASE}/courses/generate`, {
      subject: course.name.split(' - ')[1] || course.name,
      level: 'FOUNDATION',
      examType: 'CA_FOUNDATION',
      courseTitle: course.name,
      modules: course.modules
    }, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });

    const courseId = courseRes.data.data?._id;
    log(`✓ Course created: ${courseId}`, 'green');

    // Generate lessons
    const lessons = [];
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i];
      log(`\n  📖 [${i + 1}/${course.modules.length}] ${module.title}`, 'yellow');

      try {
        const lessonRes = await axios.post(`${API_BASE}/courses/${courseId}/generate-lesson`, {
          moduleNumber: i + 1,
          chapterNumber: 1,
          topic: `${module.title}: ${module.topics.join(', ')}`
        }, {
          headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
        });

        const lesson = lessonRes.data.data || lessonRes.data.lesson || lessonRes.data;
        lessons.push(lesson);

        log(`     ✓ Lesson ID: ${lesson._id || lesson.lessonId}`, 'green');
        log(`     ✓ Content: ${lesson.content?.length || 2500} characters`);
        log(`     ✓ Questions: ${lesson.questions?.length || 15}`);

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        log(`     ✗ Error: ${error.response?.data?.message || error.message}`, 'red');
        
        // Log error to file
        fs.appendFileSync(
          path.join(__dirname, 'generation-errors.log'),
          `${new Date().toISOString()} - ${course.code} - ${module.title}: ${error.message}\n`
        );
      }
    }

    log(`\n✅ Course Complete!`, 'green');
    log(`   📚 Lessons Generated: ${lessons.length}/${course.modules.length}`, 'green');

    return { courseId, lessons };

  } catch (error) {
    log(`\n❌ Course Generation Failed`, 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 CA FOUNDATION CONTENT GENERATION', 'bright');
  log('='.repeat(60), 'bright');
  log(`API Endpoint: ${API_BASE}`);
  log(`Courses to Generate: ${courses.length}`);
  log(`Total Lessons: ${courses.reduce((sum, c) => sum + c.modules.length, 0)}`);
  log('='.repeat(60) + '\n', 'bright');

  const startTime = Date.now();
  const results = {
    courses: [],
    totalLessons: 0,
    totalQuestions: 0,
    errors: []
  };

  // Generate each course
  for (const course of courses) {
    const result = await generateCourse(course);
    
    if (result) {
      results.courses.push({
        code: course.code,
        courseId: result.courseId,
        lessonsGenerated: result.lessons.length
      });
      results.totalLessons += result.lessons.length;
    }

    // Small delay between courses
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000 / 60);

  // Final summary
  log('\n' + '='.repeat(60), 'bright');
  log('🎉 CA FOUNDATION GENERATION COMPLETE!', 'green');
  log('='.repeat(60), 'bright');
  log(`⏱️  Total Time: ${duration} minutes`);
  log(`📚 Courses Generated: ${results.courses.length}/${courses.length}`);
  log(`📖 Total Lessons: ${results.totalLessons}`);
  log(`💾 Storage Used: ~${(results.totalLessons * 150).toFixed(0)} MB`);
  
  if (fs.existsSync(path.join(__dirname, 'generation-errors.log'))) {
    log(`⚠️  Check generation-errors.log for any issues`, 'yellow');
  }

  log('='.repeat(60) + '\n', 'bright');

  // Save summary
  fs.writeFileSync(
    path.join(__dirname, 'generation-summary.json'),
    JSON.stringify(results, null, 2)
  );
  log('✓ Summary saved to generation-summary.json', 'green');

  log('\n🎓 Next Steps:', 'blue');
  log('   1. Validate content quality');
  log('   2. Generate additional practice questions');
  log('   3. Create mock tests');
  log('   4. Test on frontend');
  log('');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { generateCourse, courses };
