# 🚀 AI Education Service - Quick Start Guide

## 📋 Prerequisites

1. **Get FREE API Keys** (5 minutes)
   
   **Groq API** (FREE - 30 req/min):
   - Visit: https://console.groq.com
   - Sign up with email
   - Go to API Keys → Create API Key
   - Copy the key

   **Gemini API** (FREE - 2M tokens/min):
   - Visit: https://ai.google.dev
   - Click "Get API Key" → "Get API key in Google AI Studio"
   - Click "Create API Key"
   - Copy the key

2. **Install Python Dependencies**
   ```bash
   # For Windows
   pip install edge-tts openai-whisper

   # Verify installation
   edge-tts --list-voices | findstr "en-IN"
   whisper --help
   ```

---

## 🎯 Option 1: Quick Test (Standalone)

```bash
# 1. Navigate to service
cd services/education-service

# 2. Install dependencies
npm install

# 3. Create .env file
copy .env.example .env

# 4. Edit .env and add your API keys
notepad .env

# Add these lines:
# GROQ_API_KEY=your_groq_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here

# 5. Start MongoDB and Redis (if not running)
# Using Docker:
docker-compose up -d mongodb redis

# Or install locally:
# MongoDB: https://www.mongodb.com/try/download/community
# Redis: https://redis.io/download

# 6. Start the service
npm run dev

# ✅ Service running on http://localhost:3013
```

### Test the APIs

```bash
# 1. Health check
curl http://localhost:3013/api/education/health

# 2. Get available voices
curl http://localhost:3013/api/education/tutor/voices

# 3. Ask a question (no auth required for testing)
curl -X POST http://localhost:3013/api/education/tutor/ask \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What is accounting?\",\"context\":{\"subject\":\"Accounting\"}}"
```

---

## 🐳 Option 2: Full Stack with Docker

```bash
# 1. Add API keys to main .env
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
notepad .env

# Add these lines:
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# 2. Start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f education-service

# 4. Verify health
curl http://localhost:8080/api/education/health

# ✅ All services running!
```

---

## 🎓 Generate Your First Course

### Step 1: Get Auth Token

```bash
# Register a user (if not already)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@test.com\",\"password\":\"Test123\",\"name\":\"Test Student\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@test.com\",\"password\":\"Test123\"}"

# Copy the "token" from response
```

### Step 2: Generate a Course

```bash
# Generate CA Foundation Accounting Course
curl -X POST http://localhost:8080/api/education/courses/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"subject\":\"Accounting\",\"level\":\"FOUNDATION\",\"examType\":\"CA_FOUNDATION\"}"

# This will take ~30 seconds
# You'll get a complete course with:
# - 8-10 modules
# - 50+ chapters
# - 200+ topics
# - Learning objectives
# - All AI-generated!
```

### Step 3: Generate a Lesson

```bash
# Use the courseId from previous response
curl -X POST http://localhost:8080/api/education/courses/{courseId}/generate-lesson \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"moduleNumber\":1,\"chapterNumber\":1,\"topic\":\"Introduction to Accounting\"}"

# This will generate:
# - Detailed explanation (2000+ words)
# - 5 solved examples
# - 5 practice problems
# - Exam tips
# - Audio lecture
```

---

## 💬 Chat with AI Tutor

```bash
# Start chat session
curl -X POST http://localhost:8080/api/education/tutor/chat/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"subject\":\"Accounting\",\"examType\":\"CA_FOUNDATION\"}"

# Copy sessionId from response

# Send message
curl -X POST http://localhost:8080/api/education/tutor/chat/{sessionId}/message \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Explain double entry system\"}"

# You'll get instant AI response!
```

---

## 🎤 Voice Question (Advanced)

```bash
# Record your question as audio file (question.mp3)

# Upload and get answer
curl -X POST http://localhost:8080/api/education/tutor/voice/question \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio=@question.mp3" \
  -F "context={\"subject\":\"Accounting\"}"

# Response includes:
# - Transcribed question
# - Text answer
# - Audio answer (URL)
```

---

## 📝 Generate Practice Questions

```bash
curl -X POST http://localhost:8080/api/education/tests/generate-questions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"topic\":\"Journal Entries\",\"subject\":\"Accounting\",\"examType\":\"CA_FOUNDATION\",\"difficulty\":\"Medium\",\"count\":10}"

# You'll get:
# - 10 MCQs matching CA exam pattern
# - Detailed explanations
# - Common mistakes
# - Exam tips
```

---

## 🎯 Generate Personalized Study Plan

```bash
# First, enroll in a course
curl -X POST http://localhost:8080/api/education/courses/{courseId}/enroll \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"targetExamDate\":\"2024-12-31\",\"dailyGoalHours\":3}"

# Then generate study plan
curl -X POST http://localhost:8080/api/education/progress/{courseId}/study-plan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"examDate\":\"2024-12-31\",\"dailyHours\":3}"

# You'll get:
# - Day-by-day study schedule
# - Topics to cover each day
# - Mock test schedule
# - Revision cycles
```

---

## 🐛 Troubleshooting

### Issue: "Groq API error: Invalid API key"
**Solution**: Check your GROQ_API_KEY in .env file

### Issue: "edge-tts: command not found"
**Solution**: 
```bash
pip install edge-tts
# Verify: edge-tts --list-voices
```

### Issue: "whisper: command not found"
**Solution**:
```bash
pip install openai-whisper
# Verify: whisper --help
```

### Issue: "MongoDB connection error"
**Solution**:
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Or start it
docker-compose up -d mongodb
```

### Issue: "Redis connection failed"
**Solution**:
```bash
# Check if Redis is running
docker-compose ps redis

# Or start it
docker-compose up -d redis
```

---

## 📊 Monitor the Service

```bash
# View logs
docker-compose logs -f education-service

# Check health
curl http://localhost:3013/api/education/health

# Check AI services health
curl http://localhost:3013/api/education/ai/health

# View service info
curl http://localhost:3013/
```

---

## 🎉 Success Indicators

✅ Service starts without errors  
✅ Health endpoint returns "healthy"  
✅ Can generate a course (takes ~30s)  
✅ Can generate a lesson (takes ~20s)  
✅ AI tutor responds to questions (< 2s)  
✅ Voice features work (if Python deps installed)  

---

## 📚 What's Next?

1. **Explore the API**
   - Read full docs: `services/education-service/README.md`
   - Try all endpoints with Postman

2. **Generate Content**
   - Create courses for CA, IAS, JEE, NEET
   - Generate lessons for all chapters
   - Build question bank

3. **Test AI Features**
   - Chat with AI tutor
   - Try voice Q&A
   - Generate study plans

4. **Build Frontend**
   - Education dashboard
   - Lesson viewer
   - AI chat interface
   - Test interface

---

## 🚀 Production Deployment

1. **Get Production API Keys**
   - Groq: Still FREE (30 req/min)
   - Gemini: Still FREE (2M tokens/min)

2. **Setup Cloud Infrastructure**
   - MongoDB Atlas (free tier: 512MB)
   - Redis Cloud (free tier: 30MB)
   - Any cloud server (DigitalOcean, AWS, etc.)

3. **Configure Environment**
   ```bash
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...
   REDIS_HOST=redis-xxxxx.cloud.redislabs.com
   ```

4. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 💡 Tips

- **Cache Works!** - Second request for same course is instant
- **Fallback Works!** - If Groq fails, Gemini takes over automatically
- **Voice is FREE!** - Unlimited audio generation with Edge TTS
- **AI is Smart!** - Exam-specific content for each exam type

---

**Need Help?**
- Check logs: `docker-compose logs education-service`
- Read docs: `services/education-service/README.md`
- Test APIs: Use Postman or curl

**Ready to revolutionize education with AI!** 🎓🤖
