# 🤖 AI-Powered Education Service

**Zero human intervention** - Everything from course creation to teaching is done by AI using **100% FREE APIs**!

---

## 🎯 Features

### AI-Powered Content Generation
- ✅ **Auto-generate complete courses** for CA, IAS, JEE, NEET exams
- ✅ **AI-generated lessons** with explanations, examples, and practice problems
- ✅ **Smart question generation** matching exact exam patterns
- ✅ **Adaptive tests** personalized to student performance

### AI Tutor (24/7 Doubt Resolution)
- ✅ **Chat with AI tutor** - instant answers to any question
- ✅ **Voice questions** - ask doubts by speaking (speech-to-text)
- ✅ **Voice answers** - get audio explanations (text-to-speech)
- ✅ **Image questions** - upload problem images for solutions

### Personalized Learning
- ✅ **AI study plans** - customized day-by-day schedule
- ✅ **Progress tracking** - monitor learning, streaks, scores
- ✅ **Smart recommendations** - AI suggests what to study next
- ✅ **Performance analytics** - detailed topic-wise analysis

### Voice Features (FREE!)
- ✅ **Audio lectures** - AI-generated voice narration for all lessons
- ✅ **Speech-to-text** - ask questions using voice
- ✅ **Text-to-speech** - listen to answers and lessons

---

## 🆓 Free AI APIs Used

| Service | Provider | Cost | Features |
|---------|----------|------|----------|
| **Groq API** | Groq | FREE | Fast AI responses (30 req/min) |
| **Gemini API** | Google | FREE | 2M tokens/min |
| **Edge TTS** | Microsoft | FREE | Unlimited voice generation |
| **Whisper STT** | OpenAI | FREE | Self-hosted speech-to-text |

**Total Monthly Cost: ₹0** (for first 10K students) 🎉

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- MongoDB
- Redis
- Python 3.8+ (for TTS/STT)

# Install Python dependencies
pip install edge-tts openai-whisper
```

### Installation

```bash
# 1. Install dependencies
cd services/education-service
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and add your API keys:
# - GROQ_API_KEY (get from console.groq.com)
# - GEMINI_API_KEY (get from ai.google.dev)

# 3. Start the service
npm run dev

# Service will run on http://localhost:3013
```

### Get API Keys (FREE)

1. **Groq API Key** (FREE)
   - Visit: https://console.groq.com
   - Sign up → Create API key
   - 30 requests/minute free forever

2. **Gemini API Key** (FREE)
   - Visit: https://ai.google.dev
   - Get API key
   - 2M tokens/minute free

---

## 📡 API Endpoints

### Courses

```bash
# Get all courses
GET /api/education/courses?examType=CA_FOUNDATION

# Generate new course with AI
POST /api/education/courses/generate
{
  "subject": "Accounting",
  "level": "FOUNDATION",
  "examType": "CA_FOUNDATION"
}

# Enroll in course
POST /api/education/courses/:courseId/enroll

# Generate lesson for chapter
POST /api/education/courses/:courseId/generate-lesson
{
  "moduleNumber": 1,
  "chapterNumber": 1,
  "topic": "Introduction to Accounting"
}
```

### AI Tutor

```bash
# Ask question
POST /api/education/tutor/ask
{
  "question": "What is double entry system?",
  "context": {
    "subject": "Accounting",
    "examType": "CA_FOUNDATION"
  }
}

# Start chat session
POST /api/education/tutor/chat/start
{
  "courseId": "course_id",
  "subject": "Accounting"
}

# Send message in chat
POST /api/education/tutor/chat/:sessionId/message
{
  "message": "Explain journal entries"
}

# Voice question
POST /api/education/tutor/voice/question
Content-Type: multipart/form-data
{
  "audio": <audio file>,
  "context": {"subject": "Accounting"}
}

# Get hints (without giving away answer)
POST /api/education/tutor/hints
{
  "question": "Calculate the depreciation...",
  "difficulty": "medium"
}
```

### Tests

```bash
# Generate practice questions
POST /api/education/tests/generate-questions
{
  "topic": "Journal Entries",
  "subject": "Accounting",
  "examType": "CA_FOUNDATION",
  "difficulty": "Medium",
  "count": 10
}

# Generate adaptive test (personalized)
POST /api/education/tests/generate-adaptive
{
  "courseId": "course_id",
  "totalQuestions": 30
}

# Start test attempt
POST /api/education/tests/:testId/start

# Submit answer
POST /api/education/tests/attempt/:attemptId/answer
{
  "questionId": "question_id",
  "answer": "A",
  "timeTaken": 45
}

# Submit test
POST /api/education/tests/attempt/:attemptId/submit
```

### Progress & Analytics

```bash
# Get progress
GET /api/education/progress/:courseId

# Mark lesson complete
POST /api/education/progress/lesson/:lessonId/complete
{
  "timeSpent": 1800
}

# Generate study plan
POST /api/education/progress/:courseId/study-plan
{
  "examDate": "2024-12-31",
  "dailyHours": 3
}

# Get AI recommendations
GET /api/education/progress/:courseId/recommendations

# Get analytics
GET /api/education/progress/:courseId/analytics
```

---

## 🗂️ Project Structure

```
education-service/
├── src/
│   ├── ai/                    # AI clients and generators
│   │   ├── groq-client.js     # Groq API integration
│   │   ├── gemini-client.js   # Gemini API integration
│   │   ├── ai-router.js       # Smart AI routing with fallback
│   │   ├── content-generator.js # Generate courses, lessons, questions
│   │   └── tutor-engine.js    # AI tutor for Q&A
│   │
│   ├── tts/                   # Voice features
│   │   ├── edge-tts-client.js # Text-to-speech (FREE)
│   │   ├── whisper-client.js  # Speech-to-text (FREE)
│   │   └── voice-manager.js   # Voice orchestration
│   │
│   ├── models/                # MongoDB models
│   │   ├── Course.js          # Course curriculum
│   │   ├── Lesson.js          # Lesson content
│   │   ├── Question.js        # Practice questions
│   │   ├── Test.js            # Mock tests
│   │   ├── TestAttempt.js     # Student test submissions
│   │   ├── StudentProgress.js # Learning progress
│   │   └── ChatSession.js     # AI tutor chats
│   │
│   ├── controllers/           # Request handlers
│   │   ├── courseController.js
│   │   ├── tutorController.js
│   │   ├── testController.js
│   │   └── progressController.js
│   │
│   ├── routes/                # API routes
│   │   ├── courses.js
│   │   ├── tutor.js
│   │   ├── tests.js
│   │   └── progress.js
│   │
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT verification
│   │   └── upload.js          # File upload handling
│   │
│   ├── utils/                 # Utilities
│   │   ├── logger.js          # Winston logger
│   │   └── cache.js           # Redis cache
│   │
│   └── index.js               # Main server file
│
├── uploads/                   # User uploads
│   ├── audio/                 # Voice recordings
│   └── images/                # Problem images
│
├── package.json
├── .env
└── README.md
```

---

## 💡 How It Works

### 1. AI Course Generation

```javascript
// Student requests a course
POST /api/education/courses/generate
{
  "subject": "Accounting",
  "level": "FOUNDATION",
  "examType": "CA_FOUNDATION"
}

// AI generates complete curriculum:
// ✓ 8-10 modules
// ✓ 50+ chapters
// ✓ 200+ topics
// ✓ Learning objectives
// ✓ Difficulty progression
// All in ~30 seconds!
```

### 2. AI Lesson Content

```javascript
// When student clicks a chapter
POST /api/education/courses/:courseId/generate-lesson

// AI generates:
// ✓ Detailed explanation (2000+ words)
// ✓ Key concepts with definitions
// ✓ 5 solved examples
// ✓ 5 practice problems
// ✓ Real-world applications
// ✓ Common mistakes to avoid
// ✓ Exam tips
// ✓ Quick revision points
```

### 3. Voice Lecture Generation

```javascript
// Behind the scenes:
1. AI generates lecture script from lesson
2. Edge TTS converts to natural speech
3. Audio saved and served to student
4. Subtitles auto-generated with Whisper

// Result: Full audio lecture in minutes!
```

### 4. AI Tutor Chat

```javascript
// Student asks: "What is journal entry?"

// AI responds with:
// ✓ Clear definition
// ✓ Step-by-step explanation
// ✓ Examples
// ✓ Exam tips
// ✓ Practice question

// Response time: < 2 seconds
```

### 5. Adaptive Testing

```javascript
// AI analyzes student performance:
// - Weak topics: Journal Entries (45% accuracy)
// - Strong topics: Accounting Concepts (85% accuracy)

// Generates personalized test:
// ✓ 50% questions from weak topics (easier level)
// ✓ 30% questions from mixed topics (medium)
// ✓ 20% questions from strong topics (challenging)

// Result: Perfect difficulty for learning!
```

---

## 📊 Database Models

### Course
- Curriculum with modules and chapters
- AI generation metadata
- Enrollment count
- Rating and reviews

### Lesson
- Detailed content for each chapter
- Key concepts and examples
- Practice problems
- Audio/video URLs
- View and completion stats

### Question
- MCQ with 4 options
- Detailed explanation
- Topic and difficulty tagging
- Usage statistics
- Accuracy tracking

### StudentProgress
- Completed lessons and chapters
- Study streak tracking
- Test scores history
- Topic-wise performance
- AI recommendations
- Study plan

### ChatSession
- Student-AI conversations
- Message history with timestamps
- Voice/image support
- Session stats

### Test & TestAttempt
- Mock tests structure
- Student submissions
- Auto-scoring
- Performance analysis

---

## 🎯 Supported Exams

| Exam | Levels | Subjects |
|------|--------|----------|
| **CA** | Foundation, Intermediate, Final | Accounting, Law, Tax, Audit, etc. |
| **IAS** | Prelims, Mains | History, Polity, Economy, Geography, etc. |
| **JEE** | Main, Advanced | Physics, Chemistry, Mathematics |
| **NEET** | - | Physics, Chemistry, Biology |
| **State** | Various | Custom syllabus |

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3013
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/mgrand-hub
REDIS_HOST=localhost
REDIS_PORT=6379

# AI APIs (FREE)
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# JWT
JWT_SECRET=your_secret_key

# TTS Configuration
TTS_VOICE=en-IN-NeerjaNeural
TTS_RATE=+0%
TTS_VOLUME=+0%

# Cache TTL
CACHE_CURRICULUM_TTL=86400
CACHE_LESSON_TTL=3600
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t education-service .

# Run container
docker run -p 3013:3013 \
  -e GROQ_API_KEY=your_key \
  -e GEMINI_API_KEY=your_key \
  education-service
```

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB Atlas (cloud database)
- [ ] Setup Redis Cloud (managed Redis)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for your domain
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Enable rate limiting
- [ ] Setup error tracking (Sentry)
- [ ] Configure backups
- [ ] Load testing

---

## 📈 Scaling

### Performance Optimization

1. **Caching Strategy**
   - Curriculum cached for 24 hours
   - Lessons cached for 1 hour
   - Questions cached for 30 minutes
   - Use Redis for fast access

2. **Database Optimization**
   - Indexed fields for fast queries
   - Aggregation pipelines for analytics
   - Connection pooling

3. **AI API Optimization**
   - Smart routing (Groq for speed, Gemini for complexity)
   - Automatic fallback if one fails
   - Response caching
   - Batch processing

### Cost Scaling

| Students | Monthly Cost | Cost/Student |
|----------|--------------|--------------|
| 100 | ₹0 | ₹0 |
| 1,000 | ₹0 | ₹0 |
| 10,000 | ₹7,000 | ₹0.70 |
| 100,000 | ₹50,000 | ₹0.50 |

---

## 🐛 Troubleshooting

### Common Issues

**1. Groq API Rate Limit**
```
Error: Rate limit exceeded
Solution: Wait 60 seconds or use Gemini fallback
```

**2. Edge TTS Not Found**
```
Error: edge-tts command not found
Solution: pip install edge-tts
```

**3. Whisper Not Found**
```
Error: whisper command not found
Solution: pip install openai-whisper
```

**4. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED
Solution: Check MongoDB is running: mongod
```

---

## 📚 Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Edge TTS GitHub](https://github.com/rhasspy/edge-tts)
- [Whisper Documentation](https://github.com/openai/whisper)

---

## 🤝 Contributing

Want to add more features? Ideas:
- Add more exam types (GATE, CAT, etc.)
- Multi-language support
- Video generation with Manim
- AR/VR lessons
- Group study features
- Parent dashboard

---

## 📄 License

ISC License

---

**Built with ❤️ by MGrand Hub Team**

**Powered by AI • 100% Free APIs • Zero Human Tutors** 🚀
