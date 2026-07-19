# 🚀 Install Local MongoDB (Quick Solution)

Since MongoDB Atlas connection is blocked by your network/firewall, let's use local MongoDB instead.

## Option 1: Install MongoDB Community (Recommended)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (latest)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded MSI file
2. Choose "Complete" installation
3. **IMPORTANT:** Check "Install MongoDB as a Service" ✅
4. Keep default settings
5. Click "Install"

### Step 3: Verify Installation
Open Command Prompt and run:
```bash
mongod --version
```

You should see the MongoDB version printed.

### Step 4: Update Connection String
Already done! Your `.env` is ready to use with local MongoDB.

### Step 5: Test Connection
```bash
cd services\education-service
node test-mongo-connection.js
```

You should see: ✅ MongoDB connected successfully!

---

## Option 2: Use MongoDB with Chocolatey (Faster)

If you have Chocolatey installed:

```bash
choco install mongodb
```

Then follow Steps 4-5 above.

---

## Option 3: Use Docker (If you have Docker)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then follow Steps 4-5 above.

---

## 🎯 After MongoDB is Running

### Start Backend Service
```bash
cd services\education-service
npm start
```

You should see: ✅ MongoDB connected successfully

### Generate All Content (122 Lessons)
```bash
cd scripts
node generate-all-content.js
```

This will take ~3-4 hours and generate:
- 122 complete lessons
- AI-generated content (2,000-3,000 words each)
- Audio files (15-20 min each)
- Video metadata
- Animations (5 per lesson)
- MCQs (10-20 per lesson)

---

## 💡 Why Local MongoDB?

**Pros:**
- ✅ No network issues
- ✅ Faster (no internet latency)
- ✅ Works offline
- ✅ Free and unlimited
- ✅ Perfect for development

**Cons:**
- ❌ Data is only on your machine
- ❌ Need to export/import when deploying

For production deployment, you can:
1. Export data: `mongodump --db superappmango`
2. Import to Atlas: `mongorestore --uri "mongodb+srv://..." --db superappmango dump/superappmango`

---

## 📝 Current Configuration

Your `.env` file is already configured for local MongoDB:
```
MONGO_URI=mongodb://localhost:27017/superappmango
```

Just install MongoDB and you're ready to go! 🚀
