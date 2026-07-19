# 🚀 Course Generation Guide - Personal AI Tutor Platform

## Overview
This guide explains how to use the AI system to generate complete courses for CA, IAS, Engineering, and School students. All content is 100% AI-generated with zero human intervention.

---

## 📋 Prerequisites

### 1. API Keys Required (All FREE!)
```env
# Groq API (FREE - No credit card required)
GROQ_API_KEY=your_groq_key_here
# Get from: https://console.groq.com/keys

# Google Gemini API (FREE - 1M tokens/month)
GEMINI_API_KEY=your_gemini_key_here
# Get from: https://makersuite.google.com/app/apikey
```

### 2. System Dependencies
```bash
# FFmpeg (for video generation)
# Windows: Download from https://ffmpeg.org/download.html
# Add to PATH

# Python 3.8+ (for Manim animations)
# Windows: Download from https://python.org

# Manim Community
pip install manim

# Node.js dependencies (already in package.json)
npm install
```

---

## 🎯 Step-by-Step Course Generation

### Step 1: Generate Course Curriculum

**API Endpoint:** `POST /api/education/courses/generate`

**Request:**
```json
{
  "courseCode": "CA-F-ACC",
  "courseName": "Principles and Practice of Accounting",
  "category": "professional",
  "difficulty": "intermediate",
  "targetExam": "CA Foundation",
  "totalHours": 120,
  "syllabusUrl": "https://icai.org/syllabus/ca-foundation-accounting.pdf"
}
```

**What AI Does:**
1. Fetches official syllabus from ICAI website
2. Analyzes exam pattern and previous papers
3. Creates modular curriculum structure
4. Generates learning objectives for each module
5. Creates prerequisite chain
6. Estimates time for each topic

**Output:**
```json
{
  "courseId": "6789abc123def456",
  "curriculum": {
    "modules": [
      {
        "moduleNumber": 1,
        "title": "Introduction to Accounting",
        "chapters": [
          {
            "chapterNumber": 1,
            "title": "Accounting Concepts and Conventions",
            "topics": [
              "Business Entity Concept",
              "Money Measurement Concept",
              "Going Concern Concept",
              // ... more topics
            ],
            "estimatedHours": 8,
            "difficulty": "beginner"
          }
        ]
      }
    ]
  }
}
```

**Time:** 2-3 minutes per course

---

### Step 2: Generate Lesson Content

**API Endpoint:** `POST /api/education/lessons/generate`

**Request:**
```json
{
  "courseId": "6789abc123def456",
  "chapterId": "ch-001",
  "generationOptions": {
    "includeAudio": true,
    "includeVideo": true,
    "includeAnimations": true,
    "includeQuestions": true,
    "detailLevel": "comprehensive"
  }
}
```

**What AI Does:**

#### Phase 1: Text Content Generation (30 seconds)
```
AI analyzes:
- Chapter topic and prerequisites
- Related concepts in syllabus
- Common student difficulties
- Exam weightage

AI generates:
- 2500-word comprehensive text
- Introduction with objectives
- Concept explanations with examples
- 5-10 solved problems
- Common mistakes to avoid
- Exam tips and tricks
- Quick revision notes
```

#### Phase 2: Audio Lecture (1 minute)
```
AI creates lecture script:
- Introduction (2 min)
- Concept explanation (8 min)
- Example walkthrough (6 min)
- Summary and tips (2 min)

Edge TTS generates:
- Natural Indian English voice
- Perfect pronunciation
- Appropriate pauses
- Clear narration

Output: 18-minute MP3 file
```

#### Phase 3: Video Slides (1-2 minutes)
```
AI designs 12 slides:
1. Title slide with topic
2. Learning objectives
3. Key concepts (3-4 slides)
4. Examples (3-4 slides)
5. Important formulas
6. Common mistakes
7. Exam tips
8. Summary

node-canvas generates:
- Professional templates
- Clear typography
- Color-coded sections
- Diagrams and tables

FFmpeg combines:
- Slides + Audio = Video
- Smooth transitions
- Proper timing

Output: 18-minute MP4 video
```

#### Phase 4: Animated Examples (2-3 minutes)
```
For accounting problems:
AI generates Python script:
- Journal entries appear one by one
- Ledger accounts update automatically
- Trial balance calculates step-by-step
- Financial statements build progressively

Manim renders:
- Whiteboard-style animation
- Professional handwriting effect
- Color highlighting for important parts
- 2-3 minutes per animation

Output: 5 animation videos (MP4)
```

#### Phase 5: Practice Questions (30 seconds)
```
AI generates 15 MCQs:
- 5 easy (concept recall)
- 7 medium (application)
- 3 hard (analysis)

Each question includes:
- Question text
- 4 options
- Correct answer
- Detailed explanation
- Hint for solving
- Related concept link
- Difficulty tag
- Expected time
```

**Total Lesson Generation Time:** 5-7 minutes

**Output Structure:**
```
Lesson: Accounting Concepts and Conventions
├── content.md (2500 words)
├── audio.mp3 (18 minutes)
├── video.mp4 (18 minutes)
├── animations/
│   ├── example1-business-entity.mp4 (2 min)
│   ├── example2-money-measurement.mp4 (2 min)
│   ├── example3-going-concern.mp4 (3 min)
│   ├── example4-matching-concept.mp4 (2 min)
│   └── example5-accrual-concept.mp4 (2 min)
└── questions.json (15 MCQs)
```

---

### Step 3: Generate Practice Tests

**API Endpoint:** `POST /api/education/tests/generate`

**Request:**
```json
{
  "courseId": "6789abc123def456",
  "testType": "chapter",
  "chapters": ["ch-001", "ch-002"],
  "duration": 60,
  "totalMarks": 50,
  "difficulty": "medium"
}
```

**What AI Does:**
1. Selects questions from question bank
2. Balances difficulty distribution
3. Covers all topics proportionally
4. Creates marking scheme
5. Generates detailed answer key

**Output:**
```json
{
  "testId": "test-001",
  "questions": [/* 50 questions */],
  "duration": 60,
  "totalMarks": 50,
  "sections": [
    {
      "name": "Section A - Multiple Choice",
      "questions": 20,
      "marksPerQuestion": 1
    },
    {
      "name": "Section B - Short Answer",
      "questions": 6,
      "marksPerQuestion": 3
    },
    {
      "name": "Section C - Long Answer",
      "questions": 4,
      "marksPerQuestion": 5
    }
  ]
}
```

---

## 🎨 Content Quality Standards

### Text Content Quality Checklist
- ✅ Starts with clear learning objectives
- ✅ Uses simple language (12th grade reading level)
- ✅ Includes real-world examples
- ✅ Has visual aids (tables, diagrams)
- ✅ Highlights key formulas/definitions
- ✅ Provides step-by-step problem solving
- ✅ Lists common mistakes
- ✅ Ends with quick revision notes
- ✅ Includes exam-specific tips

### Audio Quality Checklist
- ✅ Clear pronunciation
- ✅ Natural speech pace (140-160 words/min)
- ✅ Appropriate pauses between concepts
- ✅ Emphasis on important terms
- ✅ Indian English accent
- ✅ No background noise
- ✅ Consistent volume level

### Video Quality Checklist
- ✅ Professional slide design
- ✅ Readable fonts (minimum 24pt)
- ✅ High contrast colors
- ✅ Synchronized audio-visual
- ✅ Smooth transitions
- ✅ Clear diagrams
- ✅ Proper timing (not too fast/slow)

### Animation Quality Checklist
- ✅ Step-by-step progression
- ✅ Clear handwriting effect
- ✅ Color coding for clarity
- ✅ Appropriate speed
- ✅ Final answer highlighted
- ✅ 720p or 1080p resolution

---

## 📊 Batch Generation Strategy

### For CA Foundation (Complete Course)

**Phase 1: Generate All 4 Subjects (Day 1-2)**
```bash
# Subject 1: Accounting (10 chapters)
POST /api/education/courses/generate
  courseCode: CA-F-ACC
  
# Subject 2: Business Laws (8 chapters)
POST /api/education/courses/generate
  courseCode: CA-F-LAW
  
# Subject 3: Mathematics (12 chapters)
POST /api/education/courses/generate
  courseCode: CA-F-MATHS
  
# Subject 4: Economics (10 chapters)
POST /api/education/courses/generate
  courseCode: CA-F-ECO

Total time: 8-12 minutes
```

**Phase 2: Generate All Lessons (Day 3-7)**
```bash
# For each chapter in each subject:
# 40 chapters total × 5-7 minutes = 200-280 minutes = 3-5 hours

# Run in parallel (4 subjects simultaneously):
# Actual time: 50-70 minutes

# Can be automated with script:
node scripts/generate-all-lessons.js --course=CA-F-ACC
```

**Phase 3: Generate Question Banks (Day 8)**
```bash
# For each chapter:
# 40 chapters × 30 seconds = 20 minutes

node scripts/generate-questions.js --course=all
```

**Phase 4: Generate Mock Tests (Day 9)**
```bash
# Chapter tests: 40 tests
# Module tests: 16 tests
# Full mock tests: 10 tests
# Total: 66 tests × 1 minute = 66 minutes

node scripts/generate-tests.js --type=all
```

**Total Generation Time for CA Foundation:**
- Curriculum: 12 minutes
- Lessons: 50-70 minutes (parallel)
- Questions: 20 minutes
- Tests: 66 minutes
- **TOTAL: ~2-3 hours for complete CA Foundation course!**

**Storage Required:**
- Text content: ~50 MB
- Audio files: ~5 GB (40 lessons × 18 min × 7 MB/min)
- Video files: ~8 GB (40 lessons × 18 min × 11 MB/min)
- Animations: ~2 GB (200 animations × 2 min × 5 MB/min)
- **TOTAL: ~15 GB per subject = 60 GB for full CA Foundation**

---

## 🔄 Automated Generation Script

### Create `scripts/generate-all-lessons.js`:

```javascript
const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3003/api/education';
const courseTemplates = require('../course-templates.json');

async function generateCourse(courseCode) {
  console.log(`Generating course: ${courseCode}`);
  
  // Step 1: Generate curriculum
  const courseData = courseTemplates.courseTemplates[courseCode];
  const courseRes = await axios.post(`${API_BASE}/courses/generate`, courseData);
  const courseId = courseRes.data.courseId;
  
  console.log(`✓ Course created: ${courseId}`);
  
  // Step 2: Generate all lessons
  const modules = courseData.subjects[0].modules;
  
  for (let i = 0; i < modules.length; i++) {
    console.log(`  Generating lesson ${i+1}/${modules.length}: ${modules[i]}`);
    
    try {
      const lessonRes = await axios.post(`${API_BASE}/lessons/generate`, {
        courseId,
        chapterIndex: i,
        generationOptions: {
          includeAudio: true,
          includeVideo: true,
          includeAnimations: true,
          includeQuestions: true,
          detailLevel: 'comprehensive'
        }
      });
      
      console.log(`  ✓ Lesson ${i+1} generated: ${lessonRes.data.lessonId}`);
      
    } catch (error) {
      console.error(`  ✗ Error generating lesson ${i+1}:`, error.message);
      // Log error but continue with next lesson
      fs.appendFileSync('generation-errors.log', 
        `${new Date().toISOString()} - ${courseCode} - Lesson ${i+1}: ${error.message}\n`
      );
    }
    
    // Wait 1 second between lessons to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`✓ Course ${courseCode} complete!`);
}

// Main execution
async function main() {
  const courses = [
    'ca_foundation',
    'jee_main',
    'ias_prelims',
    'school_cbse_10'
  ];
  
  for (const course of courses) {
    await generateCourse(course);
  }
  
  console.log('\n🎉 All courses generated successfully!');
}

main().catch(console.error);
```

**Run the script:**
```bash
node scripts/generate-all-lessons.js
```

---

## 🎯 Priority Generation Order

### Week 1: CA Foundation
- Most demanded professional course
- Clear syllabus structure
- High profit potential

### Week 2: JEE Main
- Large student base
- High competition
- Premium pricing

### Week 3: CBSE Class 10
- Largest student base
- Entry point for platform
- Builds brand awareness

### Week 4: IAS Prelims
- Premium course
- High value students
- Less competition

### Week 5-8: Remaining courses
- CA Intermediate
- IAS Mains
- State engineering exams
- Other CBSE classes

---

## 📈 Quality Control & Testing

### Automated Quality Checks:

```javascript
// Check lesson completeness
function validateLesson(lesson) {
  const checks = {
    hasContent: lesson.content && lesson.content.length >= 1500,
    hasAudio: lesson.audioUrl && lesson.audioDuration >= 10,
    hasVideo: lesson.videoUrl && lesson.videoDuration >= 10,
    hasQuestions: lesson.questions && lesson.questions.length >= 10,
    hasObjectives: lesson.objectives && lesson.objectives.length >= 3
  };
  
  const passed = Object.values(checks).every(v => v === true);
  
  if (!passed) {
    console.warn('Quality check failed:', checks);
  }
  
  return passed;
}
```

### Manual Review Process:
1. **Sample 5% of lessons** - Random selection
2. **Expert review** - Subject matter check
3. **Student beta test** - Real user feedback
4. **Iterative improvement** - Fix common issues

---

## 💾 Content Storage Strategy

### Database (MongoDB):
```
- Course metadata
- Lesson metadata
- Questions and answers
- Student progress
- Test attempts
```

### File Storage (S3/CloudFlare R2):
```
- Audio files (.mp3)
- Video files (.mp4)
- Animation files (.mp4)
- PDF materials
- Images and diagrams
```

### CDN Configuration:
```
- Global distribution
- Edge caching
- Compression enabled
- Lazy loading support
```

---

## 🚀 Deployment Checklist

### Before Production Launch:

- [ ] Generate all CA Foundation content
- [ ] Generate JEE Main Physics (sample)
- [ ] Generate CBSE 10 Math (sample)
- [ ] Test lesson playback on mobile
- [ ] Test video streaming quality
- [ ] Test audio clarity
- [ ] Verify question explanations
- [ ] Check animation rendering
- [ ] Load test with 100 concurrent users
- [ ] Backup all generated content
- [ ] Setup CDN for media files
- [ ] Configure database indexes
- [ ] Enable Redis caching
- [ ] Setup monitoring alerts

---

## 📞 Troubleshooting

### Issue: Slow lesson generation
**Solution:** Run multiple generation processes in parallel

### Issue: Poor audio quality
**Solution:** Check Edge TTS voice settings, increase bitrate

### Issue: Video sync problems
**Solution:** Verify FFmpeg installation, check slide timing

### Issue: Animation not rendering
**Solution:** Ensure Python and Manim installed correctly

### Issue: Out of API credits
**Solution:** Switch to backup AI provider (Gemini ↔ Groq)

---

## 🎉 Success Metrics

### Content Generation Goals:
- ✅ CA Foundation: 40 lessons in 2-3 hours
- ✅ JEE Main: 60 lessons in 4-6 hours
- ✅ CBSE 10: 30 lessons in 2-3 hours
- ✅ IAS Prelims: 50 lessons in 3-5 hours

### Quality Benchmarks:
- ✅ 95%+ lesson completion rate
- ✅ 4.5+ average rating from students
- ✅ <5% error rate in questions
- ✅ <2% regeneration requests

**Target:** Generate 1000+ lessons in first month! 🚀
