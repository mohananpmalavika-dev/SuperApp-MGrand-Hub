# 🚀 Quick Start: PDF Content Generator

## ⏱️ 5-Minute Setup

Follow these steps to get the PDF Content Generator running:

### ✅ Step 1: Install FFmpeg (2 minutes)

```powershell
# Open PowerShell as Administrator
choco install ffmpeg

# Verify installation
ffmpeg -version
```

If you don't have Chocolatey:
- Download from: https://ffmpeg.org/download.html
- Or install Chocolatey first: https://chocolatey.org/install

### ✅ Step 2: Get API Keys (3 minutes)

**Groq API (Free):**
1. Go to: https://console.groq.com/
2. Sign up → Create API Key
3. Copy the key (starts with `gsk_`)

**Google Gemini API (Free):**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in → Create API Key
3. Copy the key

### ✅ Step 3: Configure Environment (1 minute)

```cmd
cd services\content-generation-service
copy .env.example .env
notepad .env
```

Update these lines in `.env`:
```env
GROQ_API_KEY=gsk_your_actual_groq_key_here
GEMINI_API_KEY=your_actual_gemini_key_here
JWT_SECRET=your_jwt_secret_from_main_app
```

### ✅ Step 4: Install Dependencies (2 minutes)

```cmd
npm install
```

### ✅ Step 5: Start the Service (1 second)

```cmd
npm run dev
```

You should see:
```
Content Generation Service running on port 3008
```

### ✅ Step 6: Test It! (30 seconds)

Open your browser:
```
http://localhost:3000/education/content-generator
```

Upload the "Redemption of Preference Shares" PDF and watch the magic happen! 🎉

## 🧪 Quick Test

Test the API directly:

```cmd
# Check health
curl http://localhost:3008/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "content-generation-service",
  "timestamp": "2026-07-20T..."
}
```

## 🎯 What You Get

After uploading a PDF:
- 📝 **Notes** - Structured JSON with key points, definitions, examples
- 🎙️ **Audio** - MP3 narration (~10-15 min for a typical doc)
- 🎥 **Video** - MP4 lesson with slides and audio

## ⚡ Troubleshooting

**Service won't start?**
- Check if port 3008 is free: `netstat -ano | findstr :3008`
- Verify .env file has API keys

**Upload fails?**
- Check file size (max 50MB)
- Ensure PDF is valid

**Processing stuck?**
- Check internet connection
- Verify API keys are correct
- Look at logs: `services\content-generation-service\logs\error.log`

## 📚 Full Documentation

For detailed setup and troubleshooting:
- [Complete Setup Guide](./PDF_CONTENT_GENERATOR_SETUP.md)
- [Full Summary](./PDF_CONTENT_GENERATOR_SUMMARY.md)
- [Service README](./services/content-generation-service/README.md)

## 🎉 You're Done!

The PDF Content Generator is now ready to transform your documents into multimedia learning content!

**Try it with the provided PDF:**
"Redemption of Preference Shares" - Perfect for testing all features!

---

**Total Setup Time: ~10 minutes** ⏱️

**Questions?** Check the troubleshooting section or review the logs!
