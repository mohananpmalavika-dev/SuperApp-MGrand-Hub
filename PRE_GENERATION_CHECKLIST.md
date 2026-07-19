# ✅ Pre-Generation Checklist

## Before Starting Content Generation

### 1. MongoDB Setup ✅
**Option A: MongoDB Atlas (Cloud - Recommended)**
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account
- [ ] Create free cluster (M0)
- [ ] Get connection string
- [ ] Update `.env` file

**Option B: Local MongoDB**
- [ ] Install MongoDB Community
- [ ] Start MongoDB service
- [ ] Connection: `mongodb://localhost:27017`

### 2. API Keys ✅
- [ ] **Groq API Key** (free)
  - Get from: https://console.groq.com/
  - Add to `.env`: `GROQ_API_KEY=gsk_...`
  
- [ ] **Gemini API Key** (free)
  - Get from: https://makersuite.google.com/app/apikey
  - Add to `.env`: `GEMINI_API_KEY=AIza...`

### 3. Environment File ✅
Check `services/education-service/.env`:
```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PORT=3013
NODE_ENV=development
```

### 4. Dependencies Installed ✅
```bash
# Backend
cd services/education-service
npm install

# Scripts
cd ../../scripts
npm install
```

### 5. Test Backend ✅
```bash
cd services/education-service
npm start
```

Open http://localhost:3013/ - should show service info

---

## Quick Test

Run this to verify everything is ready:

```bash
# Test MongoDB connection
mongosh "your_connection_string" --eval "db.adminCommand('ping')"

# Test backend
curl http://localhost:3013/

# Test API keys (backend logs will show if they work)
```

---

## Ready to Generate? ✅

If all checks pass:

```bash
# Terminal 1: Keep backend running
cd services/education-service
npm start

# Terminal 2: Generate content
cd scripts
node generate-all-content.js
```

---

## Estimated Resources

- **Time**: 3.5 hours
- **Network**: ~2 GB (API calls)
- **Disk**: ~20 GB free space
- **RAM**: 4 GB minimum
- **CPU**: Any (will use API services)

---

## ⚡ Quick Start (If Ready)

```bash
# Start backend
cd c:\Users\Dhanya\SuperApp-MGrand-Hub\services\education-service
npm start

# In NEW terminal - Generate
cd c:\Users\Dhanya\SuperApp-MGrand-Hub\scripts
node generate-all-content.js
```

---

**📚 Need setup help? Read:** `START_CONTENT_GENERATION.md`
