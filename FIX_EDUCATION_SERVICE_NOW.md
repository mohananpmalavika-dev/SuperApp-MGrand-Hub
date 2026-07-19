# 🚨 URGENT: Fix Education Service Deployment

## The Problem
Your education-service deployment is failing with:
```
GroqError: The GROQ_API_KEY environment variable is missing or empty
```

## Why This Happened
The education-service uses **Groq AI** (free, fast AI API) for generating educational content. The service crashes immediately on startup because it tries to initialize the Groq client before the API key is set.

---

## 🎯 Quick Fix - Add Required Environment Variables

### Step 1: Get Your FREE Groq API Key

1. **Go to Groq Cloud Console**: https://console.groq.com/
2. **Sign up** (free account, no credit card required)
3. **Navigate to API Keys**: Click "API Keys" in left sidebar
4. **Create New Key**:
   - Click "Create API Key"
   - Name it: `education-service-production`
   - Click "Submit"
5. **Copy the key** (starts with `gsk_...`)
   - ⚠️ Save it immediately - you can't see it again!

### Step 2: Get MongoDB Connection String

Same as tutor-service - you need MongoDB Atlas:

1. **MongoDB Atlas**: https://cloud.mongodb.com/
2. **Use same cluster** you created for tutor-service
3. **Get connection string**:
   ```
   mongodb+srv://mgrandhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mgrand-hub-education?retryWrites=true&w=majority
   ```
   - Note: Different database name: `mgrand-hub-education`

### Step 3: Add Environment Variables in Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your education-service**
3. **Click "Environment"** in left sidebar
4. **Add these variables**:

#### Required (Service Won't Start Without These):

```
Key: GROQ_API_KEY
Value: gsk_your_actual_groq_api_key_here
```

```
Key: MONGO_URI
Value: mongodb+srv://mgrandhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mgrand-hub-education?retryWrites=true&w=majority
```

```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 3013
```

#### Optional (For Full Functionality):

```
Key: GOOGLE_AI_API_KEY
Value: your-gemini-api-key (for Gemini AI features)
```

```
Key: REDIS_DISABLED
Value: true (if you don't have Redis yet)
```

```
Key: OPENAI_API_KEY
Value: sk-your-openai-key (optional, for advanced features)
```

```
Key: CORS_ORIGIN
Value: https://your-frontend-url.onrender.com
```

```
Key: DNS_SERVERS
Value: 8.8.8.8,8.8.4.4 (Google DNS for reliability)
```

### Step 4: Save and Deploy

1. **Click "Save Changes"** at the bottom
2. **Render will automatically redeploy**
3. **Watch the logs** for success:
   ```
   ✓ MongoDB connected successfully
   ✓ Redis disabled; continuing without cache
   ✓ Education Service running on port 3013
   ```

---

## 🎁 Optional: Get Google Gemini API Key (FREE)

For enhanced AI features (alternative to Groq):

1. **Go to Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with Google account
3. **Get API Key**:
   - Click "Get API Key" button
   - Create new key or use existing
4. **Copy the key** and add to Render:
   ```
   Key: GOOGLE_AI_API_KEY
   Value: your-gemini-api-key
   ```

---

## 📋 Complete Environment Variables Checklist

### Minimum Required (Must Have):
- ✅ `GROQ_API_KEY` - Get from https://console.groq.com/
- ✅ `MONGO_URI` - Get from MongoDB Atlas
- ✅ `NODE_ENV=production`
- ✅ `PORT=3013`

### Recommended (Better Experience):
- ⭐ `GOOGLE_AI_API_KEY` - Get from https://aistudio.google.com/
- ⭐ `REDIS_DISABLED=true` - Set if no Redis
- ⭐ `CORS_ORIGIN` - Your frontend URL
- ⭐ `DNS_SERVERS=8.8.8.8,8.8.4.4`

### Optional (Advanced Features):
- 💡 `OPENAI_API_KEY` - For GPT models
- 💡 `REDIS_HOST` - If you have Redis
- 💡 `REDIS_PORT=6379`
- 💡 `REDIS_PASSWORD`

---

## 🔍 Verify It Works

After deployment completes:

### 1. Check Render Logs
Look for these success messages:
```
✓ MongoDB connected successfully
✓ Redis disabled; continuing without cache (or "Redis connected")
✓ Education Service running on port 3013
✓ Environment: production
```

### 2. Test Health Endpoint
Open in browser or use curl:
```bash
https://your-education-service.onrender.com/api/education/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "education-service",
  "database": "connected",
  "ai": "ready",
  "timestamp": "2026-07-19T08:30:00.000Z"
}
```

### 3. Test Root Endpoint
```bash
https://your-education-service.onrender.com/
```

Should return service information:
```json
{
  "service": "AI-Powered Education Service",
  "version": "1.0.0",
  "status": "running",
  "features": [
    "AI Course Generation (Groq + Gemini)",
    "AI Tutor Chat",
    ...
  ]
}
```

---

## 🔧 Troubleshooting

### Error: "GROQ_API_KEY environment variable is missing"
- ✅ Make sure you added the variable in Render
- ✅ Key name must be exactly: `GROQ_API_KEY` (all caps)
- ✅ Value should start with `gsk_`
- ✅ No spaces before/after the key
- ✅ Save changes and redeploy

### Error: "MongoDB connection failed"
- ✅ Check `MONGO_URI` format (must start with `mongodb+srv://`)
- ✅ Verify username/password are correct
- ✅ Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- ✅ Database user has read/write permissions

### Service starts but AI features don't work:
- ✅ Verify Groq API key is valid
- ✅ Check Groq console for usage limits
- ✅ Review logs for specific AI errors

### Slow to start or timeouts:
- ✅ Add `DNS_SERVERS=8.8.8.8,8.8.4.4`
- ✅ Increase Render instance size if needed
- ✅ Check MongoDB Atlas cluster location (should be near Render region)

---

## 🎯 What This Service Does

Once running, your education-service provides:

1. **AI Course Generation**
   - Creates complete courses from topics
   - Generates lessons, quizzes, assignments
   - Uses Groq AI (fast) or Gemini (detailed)

2. **AI Tutor Chat**
   - Real-time Q&A with students
   - Context-aware responses
   - Maintains conversation history

3. **Voice Q&A**
   - Text-to-speech responses
   - Speech-to-text questions
   - Multi-language support

4. **Adaptive Testing**
   - Generates personalized tests
   - Adjusts difficulty based on performance
   - Provides instant feedback

5. **Progress Analytics**
   - Tracks student learning
   - Identifies weak areas
   - Recommends study paths

---

## 🚀 Next Steps After Fix

1. ✅ **Test API Endpoints** with Postman:
   - `POST /api/education/courses/generate` - Generate a course
   - `POST /api/education/tutor/chat` - Chat with AI tutor
   - `GET /api/education/courses` - List courses

2. ✅ **Configure Frontend**:
   - Update frontend to use your service URL
   - Test course creation flow
   - Test tutor chat interface

3. ✅ **Monitor Usage**:
   - Check Groq console for API usage
   - Monitor MongoDB storage
   - Review Render metrics

4. ✅ **Optional Enhancements**:
   - Add Redis for caching (faster responses)
   - Add Gemini for better content quality
   - Set up custom domain

---

## 💡 Cost Breakdown

- **Groq API**: FREE (generous limits)
- **MongoDB Atlas**: FREE (512MB M0 cluster)
- **Render**: FREE tier available (spins down after inactivity)
- **Google Gemini**: FREE tier available

**Total to get started: $0** 🎉

---

## 📚 API Key Resources

- **Groq**: https://console.groq.com/ (FREE, no credit card)
- **Google Gemini**: https://aistudio.google.com/ (FREE)
- **OpenAI** (optional): https://platform.openai.com/ (Paid)
- **MongoDB Atlas**: https://cloud.mongodb.com/ (FREE tier)

---

## ⚡ Quick Copy-Paste Template

Use this in Render's environment variables section:

```
GROQ_API_KEY=gsk_your_key_here
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mgrand-hub-education?retryWrites=true&w=majority
NODE_ENV=production
PORT=3013
REDIS_DISABLED=true
DNS_SERVERS=8.8.8.8,8.8.4.4
CORS_ORIGIN=https://your-frontend.onrender.com
```

Replace:
- `gsk_your_key_here` → Your actual Groq API key
- `user:pass@cluster.mongodb.net` → Your MongoDB credentials
- `your-frontend.onrender.com` → Your actual frontend URL

---

**🎯 Bottom Line**: Add `GROQ_API_KEY` and `MONGO_URI` to Render's environment variables, save, and your service will start successfully!
