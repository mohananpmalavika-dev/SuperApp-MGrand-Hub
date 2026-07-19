const aiRouter = require('./ai-router');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

/**
 * AI-powered content generation for educational materials
 */
class ContentGenerator {
  /**
   * Generate complete course curriculum
   */
  async generateCurriculum(subject, level, examType) {
    const cacheKey = cache.getCacheKey('curriculum', examType, level, subject);
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached curriculum');
      return cached;
    }

    const prompt = `
Create a comprehensive course curriculum for competitive exam preparation:

Subject: ${subject}
Level: ${level}
Target Exam: ${examType} (${this.getExamDescription(examType)})

Generate a detailed curriculum with:
1. 8-10 major modules covering the complete syllabus
2. Each module should have 4-6 chapters
3. Each chapter should have specific topics (5-8 topics)
4. Include learning objectives for each chapter
5. Estimated study hours for each chapter
6. Difficulty progression (Easy → Medium → Hard)
7. Prerequisites for each module (if any)

Make it aligned with the actual ${examType} exam pattern and syllabus.

Return as JSON with this exact structure:
{
  "courseTitle": "string",
  "examType": "string",
  "level": "string",
  "totalDuration": "number (hours)",
  "description": "string",
  "modules": [
    {
      "moduleNumber": 1,
      "moduleName": "string",
      "description": "string",
      "duration": "number (hours)",
      "prerequisites": ["string"],
      "chapters": [
        {
          "chapterNumber": 1,
          "chapterName": "string",
          "description": "string",
          "duration": "number (hours)",
          "difficulty": "Easy|Medium|Hard",
          "learningObjectives": ["string"],
          "topics": ["string"]
        }
      ]
    }
  ]
}`;

    try {
      const curriculum = await aiRouter.generateJSON(prompt, {
        usePro: true,
        maxTokens: 8192,
      });
      
      // Cache for 24 hours
      await cache.set(cacheKey, curriculum, 86400);
      
      logger.info('Generated curriculum successfully', { examType, level, subject });
      return curriculum;
    } catch (error) {
      logger.error('Failed to generate curriculum:', error);
      throw error;
    }
  }

  /**
   * Generate detailed lesson content
   */
  async generateLessonContent(topic, subject, level, examType) {
    const cacheKey = cache.getCacheKey('lesson', examType, subject, topic);
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached lesson');
      return cached;
    }

    const prompt = `
Create a comprehensive educational lesson on: ${topic}

Course Details:
- Subject: ${subject}
- Level: ${level}
- Target Exam: ${examType}

Generate a detailed, engaging lesson with:

1. INTRODUCTION (1 concise paragraph)
   - Hook the student with why this topic matters
   - Overview of what will be covered
   - Real-world relevance for ${examType}

2. KEY CONCEPTS (exactly 3 main concepts)
   - Clear definitions
   - Simple explanations
   - Visual descriptions (what diagrams would help)

3. DETAILED EXPLANATION
   - Break down complex ideas step-by-step
   - Use analogies and real-life examples
   - Include relevant formulas/rules/principles
   - Explain the "why" not just the "what"

4. SOLVED EXAMPLES (exactly 1 problem)
   - Start with easy, progress to challenging
   - Show complete step-by-step solutions
   - Highlight common mistakes
   - Exam-pattern questions for ${examType}

5. REAL-WORLD APPLICATIONS
   - How this applies in real scenarios
   - Industry relevance
   - Current affairs connections (if applicable)

6. COMMON MISTAKES TO AVOID
   - List exactly 2 typical errors students make
   - Why they happen
   - How to avoid them

7. PRACTICE PROBLEMS (exactly 2 unsolved)
   - Mix of easy, medium, hard
   - ${examType} exam pattern
   - Just the questions (solutions separate)

8. QUICK REVISION POINTS
   - Bullet point summary
   - Key formulas/rules
   - Memory tricks/mnemonics

9. EXAM TIPS
   - Time management for ${examType}
   - Question-solving strategy
   - Scoring tips

Make the content:
- Clear and engaging (like a great teacher explaining)
- Exam-focused for ${examType}
- Appropriate for ${level} level
- Include specific numbers, facts, dates where relevant
- Use Indian context and examples
- Keep the complete JSON response under 2,000 tokens

Return as JSON with this structure:
{
  "topic": "string",
  "subject": "string",
  "duration": "number (minutes)",
  "introduction": "string (markdown supported)",
  "keyConcepts": [
    {
      "concept": "string",
      "definition": "string",
      "explanation": "string"
    }
  ],
  "detailedContent": "string (markdown supported, 300-450 words)",
  "solvedExamples": [
    {
      "question": "string",
      "solution": "string (step-by-step)",
      "keyTakeaway": "string"
    }
  ],
  "realWorldApplications": ["string"],
  "commonMistakes": [
    {
      "mistake": "string",
      "why": "string",
      "howToAvoid": "string"
    }
  ],
  "practiceProblems": [
    {
      "question": "string",
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "quickRevision": {
    "summary": ["string"],
    "formulas": ["string"],
    "mnemonics": ["string"]
  },
  "examTips": ["string"]
}`;

    try {
      const lesson = await aiRouter.generateJSON(prompt, { 
        usePro: true,
        maxTokens: 6000
      });
      
      // Cache for 1 hour
      await cache.set(cacheKey, lesson, 3600);
      
      logger.info('Generated lesson successfully', { topic, subject });
      return lesson;
    } catch (error) {
      logger.error('Failed to generate lesson:', error);
      throw error;
    }
  }

  /**
   * Generate practice questions
   */
  async generateQuestions(topic, subject, examType, difficulty, count = 10) {
    const prompt = `
Generate ${count} high-quality multiple-choice questions for competitive exam preparation:

Topic: ${topic}
Subject: ${subject}
Exam: ${examType}
Difficulty: ${difficulty}

Requirements:
1. Questions must match ${examType} exam pattern exactly
2. Mix of conceptual and numerical questions (if applicable)
3. 4 options (A, B, C, D) for each question
4. Only ONE correct answer
5. Make distractors (wrong options) plausible
6. Include detailed explanations showing complete solution steps
7. Reference key concepts tested
8. Add time estimate per question (for exam practice)

Question Types:
- Direct questions (60%)
- Statement-based questions (20%)
- Assertion-Reasoning (10%)
- Numerical/Calculation (10% if applicable)

Return as JSON array:
[
  {
    "questionNumber": 1,
    "question": "string (clear, concise question text)",
    "options": {
      "A": "string",
      "B": "string",
      "C": "string",
      "D": "string"
    },
    "correctAnswer": "A|B|C|D",
    "explanation": "string (detailed step-by-step solution)",
    "conceptTested": "string",
    "difficulty": "${difficulty}",
    "timeEstimate": "number (seconds)",
    "examRelevance": "string (why this is important for ${examType})",
    "commonMistake": "string (what wrong option students often choose and why)"
  }
]`;

    try {
      const questions = await aiRouter.generateJSON(prompt, { usePro: true });
      logger.info('Generated questions successfully', { count, topic, difficulty });
      return questions;
    } catch (error) {
      logger.error('Failed to generate questions:', error);
      throw error;
    }
  }

  /**
   * Generate adaptive test (personalized difficulty)
   */
  async generateAdaptiveTest(studentProfile, testConfig) {
    const { weakTopics, strongTopics, overallAccuracy } = studentProfile;
    const { totalQuestions, subject, examType } = testConfig;

    const prompt = `
Create a personalized adaptive test for a student:

Student Profile:
- Overall Accuracy: ${overallAccuracy}%
- Weak Topics: ${weakTopics.join(', ')}
- Strong Topics: ${strongTopics.join(', ')}

Test Configuration:
- Total Questions: ${totalQuestions}
- Subject: ${subject}
- Exam: ${examType}

Question Distribution:
- 50% from weak topics (easier to help build confidence)
- 30% from mixed topics (medium difficulty)
- 20% from strong topics (challenging to stretch student)

Generate ${totalQuestions} questions with adaptive difficulty.

Return as JSON:
{
  "testTitle": "string",
  "totalQuestions": ${totalQuestions},
  "duration": "number (minutes)",
  "instructions": ["string"],
  "sections": [
    {
      "sectionName": "string",
      "questions": [
        {
          "questionNumber": 1,
          "question": "string",
          "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
          "correctAnswer": "A|B|C|D",
          "explanation": "string",
          "topic": "string",
          "difficulty": "Easy|Medium|Hard",
          "marks": number
        }
      ]
    }
  ]
}`;

    try {
      const test = await aiRouter.generateJSON(prompt, { usePro: true });
      logger.info('Generated adaptive test', { totalQuestions, subject });
      return test;
    } catch (error) {
      logger.error('Failed to generate adaptive test:', error);
      throw error;
    }
  }

  /**
   * Generate study plan
   */
  async generateStudyPlan(studentProfile) {
    const { 
      examType, 
      examDate, 
      dailyHours, 
      weakTopics, 
      completedTopics,
      currentLevel 
    } = studentProfile;

    const daysUntilExam = Math.ceil(
      (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
Create a personalized ${daysUntilExam}-day study plan:

Student Profile:
- Target Exam: ${examType}
- Current Level: ${currentLevel}
- Days Until Exam: ${daysUntilExam}
- Daily Study Time: ${dailyHours} hours
- Weak Topics: ${weakTopics.join(', ')}
- Completed Topics: ${completedTopics.length} topics done

Generate a realistic, achievable day-by-day study plan:

1. Prioritize weak topics first
2. Include revision cycles (every 7 days)
3. Mock tests every week
4. Gradually increase difficulty
5. Leave last 10 days for pure revision + mocks
6. Include breaks and rest days

Return as JSON:
{
  "totalDays": ${daysUntilExam},
  "totalStudyHours": number,
  "phases": [
    {
      "phaseName": "string (e.g., Foundation Building, Deep Dive, Revision, etc.)",
      "startDay": number,
      "endDay": number,
      "focus": "string"
    }
  ],
  "dailyPlan": [
    {
      "day": number,
      "date": "string",
      "theme": "string",
      "tasks": [
        {
          "time": "string (e.g., 09:00-11:00)",
          "activity": "string",
          "topic": "string",
          "duration": "number (minutes)",
          "type": "Study|Practice|Revision|Test|Break"
        }
      ],
      "goals": ["string"],
      "isRestDay": boolean
    }
  ],
  "weeklyMilestones": [
    {
      "week": number,
      "goals": ["string"],
      "mockTest": "string"
    }
  ]
}`;

    try {
      const studyPlan = await aiRouter.generateJSON(prompt, { 
        usePro: true,
        maxTokens: 8192 
      });
      logger.info('Generated study plan', { days: daysUntilExam, examType });
      return studyPlan;
    } catch (error) {
      logger.error('Failed to generate study plan:', error);
      throw error;
    }
  }

  /**
   * Generate lecture script for TTS
   */
  async generateLectureScript(lessonContent) {
    const prompt = `
Convert this educational content into a natural, engaging lecture script for text-to-speech:

Content: ${JSON.stringify(lessonContent)}

Requirements:
1. Conversational tone (like a friendly teacher speaking)
2. Break into natural segments with [PAUSE] markers
3. Include rhetorical questions to engage
4. Use simple, clear language
5. Add emphasis markers [EMPHASIS] for key points
6. Include transition phrases between topics
7. Total length: 10-15 minutes when spoken
8. Add [SLOW] markers for complex concepts

Format the script with:
- [SEGMENT-1], [SEGMENT-2], etc. for 2-minute chunks
- [PAUSE-SHORT] for 1 second pause
- [PAUSE-LONG] for 3 second pause
- [EMPHASIS] for stressed words
- [SLOW] for slower speaking rate

Return plain text script (not JSON).`;

    try {
      const script = await aiRouter.generate(prompt, { needSpeed: true });
      logger.info('Generated lecture script');
      return script;
    } catch (error) {
      logger.error('Failed to generate lecture script:', error);
      throw error;
    }
  }

  /**
   * Helper: Get exam description
   */
  getExamDescription(examType) {
    const descriptions = {
      'CA_FOUNDATION': 'Chartered Accountancy Foundation - Entry level CA exam by ICAI',
      'CA_INTERMEDIATE': 'CA Intermediate (IPCC) - Second level of CA course',
      'CA_FINAL': 'CA Final - Last stage of Chartered Accountancy',
      'IAS_PRELIMS': 'UPSC Civil Services Preliminary Examination',
      'IAS_MAINS': 'UPSC Civil Services Main Examination',
      'JEE_MAIN': 'Joint Entrance Examination Main - Engineering entrance',
      'JEE_ADVANCED': 'JEE Advanced - IIT entrance examination',
      'CBSE_CLASS_10': 'CBSE Class 10 Board Examination',
      'NEET': 'National Eligibility cum Entrance Test - Medical entrance',
      'GATE': 'Graduate Aptitude Test in Engineering',
      'CAT': 'Common Admission Test - MBA entrance'
    };

    return descriptions[examType] || examType;
  }
}

module.exports = new ContentGenerator();
