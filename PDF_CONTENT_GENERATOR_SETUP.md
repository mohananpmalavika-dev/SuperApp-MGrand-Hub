# PDF Content Generator - Complete Setup Guide

This guide will help you set up the PDF Content Generator feature that converts PDF documents into study notes, audio narration, and video lessons.

## 📋 What You'll Get

After setup, you'll be able to:
1. ✅ Upload any PDF document (educational content, textbooks, etc.)
2. ✅ Automatically generate structured study notes with key points, definitions, and examples
3. ✅ Create audio narration of the content with natural-sounding voice
4. ✅ Generate video lessons with visual slides and synchronized audio

## 🔧 Prerequisites

### 1. Node.js and npm
Already installed (you're using this project!)

### 2. FFmpeg (Required for video generation)
Install FFmpeg on Windows:

```powershell
# Option 1: Using Chocolatey (recommended)
choco install ffmpeg

# Option 2: Using Scoop
scoop install ffmpeg

# Option 3: Manual installation
# Download from: https://ffmpeg.org/download.html
# Extract and add to PATH
```

Verify installation:
```cmd
ffmpeg -version
```

### 3. API Keys (Free tiers available)

#### A. Groq API Key (Free)
1. Visit: https://console.groq.com/
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

#### B. Google Gemini API Key (Free)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

## 📦 Installation Steps

### Step 1: Install Service Dependencies

```cmd
cd services\content-generation-service
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `services/content-generation-service` directory:

```cmd
copy .env.example .env
```

Edit the `.env` file with your values:

```env
# Server Configuration
PORT=3008
NODE_ENV=development

# API Keys - REPLACE WITH YOUR ACTUAL KEYS
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (use the same one from your main app)
JWT_SECRET=your_jwt_secret_here

# MongoDB (use your existing connection)
MONGODB_URI=mongodb://localhost:27017/content-generation

# File Settings (defaults are fine)
MAX_FILE_SIZE=52428800
MAX_CONCURRENT_JOBS=3
JOB_TIMEOUT=1800000

# Audio/Video Settings (defaults are fine)
TTS_VOICE=en-US-JennyNeural
VIDEO_RESOLUTION=1280x720
VIDEO_FPS=30
```

### Step 3: Update Gateway Configuration

Add the new service to your API gateway. Edit `gateway/index.js` or your main gateway file:

```javascript
// Add to your proxy configuration
const contentGenerationService = 'http://localhost:3008';

// Add route
app.use('/api/content-generation', createProxyMiddleware({
  target: contentGenerationService,
  changeOrigin: true,
}));
```

### Step 4: Install Frontend Dependencies

The frontend component uses `@mui/icons-material`:

```cmd
cd ..\..\frontend
npm install @mui/icons-material
```

## 🚀 Running the Service

### Option 1: Using the Start Script (Easiest)

```cmd
cd services\content-generation-service
start.bat
```

### Option 2: Manual Start

Development mode (with hot reload):
```cmd
cd services\content-generation-service
npm run dev
```

Production mode:
```cmd
npm start
```

### Option 3: Using Docker (if you have Docker setup)

```cmd
cd services\content-generation-service
docker build -t content-generation-service .
docker run -p 3008:3008 --env-file .env content-generation-service
```

## 🧪 Testing the Service

### 1. Check Service Health

```cmd
curl http://localhost:3008/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "content-generation-service",
  "timestamp": "2026-07-20T00:00:00.000Z"
}
```

### 2. Test with the PDF from this conversation

1. Start the frontend: `cd frontend && npm start`
2. Navigate to: `http://localhost:3000/education/content-generator`
3. Upload the "Redemption of Preference Shares" PDF
4. Wait for processing (5-10 minutes)
5. Download the generated notes, audio, and video!

## 📱 Accessing in the App

### Add Menu Item

Edit `frontend/src/components/education/EducationLayout.js` to add a menu item:

```javascript
const menuItems = [
  // ... existing items
  {
    text: 'Content Generator',
    icon: <AutoAwesome />,
    path: '/education/content-generator',
  },
];
```

### Direct URL

Once everything is running, access at:
```
http://localhost:3000/education/content-generator
```

## 🎯 How It Works

### Processing Pipeline

1. **Upload** → User uploads a PDF document
2. **Extract** → Service extracts text from PDF using pdf-parse
3. **Analyze** → Gemini AI analyzes content and creates structured notes
4. **Narrate** → Edge TTS generates natural audio narration
5. **Visualize** → FFmpeg creates video with slides and audio
6. **Download** → All assets ready for download

### Generated Content Structure

**Notes (JSON):**
```json
{
  "title": "Document Title",
  "sections": [
    {
      "title": "Section 1",
      "summary": "Overview...",
      "keyPoints": ["Point 1", "Point 2"],
      "definitions": [{"term": "...", "definition": "..."}],
      "formulas": ["Formula 1"],
      "examples": ["Example 1"]
    }
  ]
}
```

**Audio:** MP3 file with natural narration
**Video:** MP4 file with slides + audio

## 🔍 Troubleshooting

### Issue: "FFmpeg not found"

**Solution:**
```cmd
# Verify FFmpeg is installed
ffmpeg -version

# If not installed, install it:
choco install ffmpeg

# Add to PATH if needed (restart terminal after)
```

### Issue: "API key invalid"

**Solution:**
- Double-check your API keys in `.env`
- Ensure no extra spaces or quotes
- Verify keys are active in respective consoles
- Groq: https://console.groq.com/
- Gemini: https://makersuite.google.com/

### Issue: "Service not starting"

**Solution:**
```cmd
# Check if port 3008 is already in use
netstat -ano | findstr :3008

# Kill the process if needed (replace PID)
taskkill /PID <PID> /F

# Or change the PORT in .env
```

### Issue: "PDF upload fails"

**Solution:**
- Check file size (max 50MB)
- Verify PDF is not corrupted
- Check available disk space
- Look at service logs in `logs/error.log`

### Issue: "Processing takes too long"

**Solution:**
- Large PDFs take longer (5-15 minutes)
- Check your internet connection (API calls)
- Verify CPU usage isn't maxed out
- Consider reducing MAX_CONCURRENT_JOBS in .env

## 📊 Performance Tips

1. **Faster Processing:**
   - Use PDFs with clear text (not scanned images)
   - Smaller documents process faster
   - Good internet connection for AI APIs

2. **Better Results:**
   - Well-structured PDFs work best
   - Clear headings and sections
   - Standard fonts and formatting

3. **Resource Management:**
   - Limit concurrent jobs based on your RAM
   - Monitor disk space in `outputs/` folder
   - Clean up old jobs regularly

## 🔐 Security Notes

- ✅ JWT authentication required for all API calls
- ✅ Users can only access their own generated content
- ✅ File type and size validation
- ✅ Automatic cleanup of temporary files
- ✅ User data isolation

## 📁 File Structure

```
content-generation-service/
├── src/
│   ├── index.js                     # Main server
│   ├── routes/
│   │   └── contentGeneration.js     # API endpoints
│   ├── services/
│   │   └── PDFContentGenerator.js   # Core logic
│   ├── middleware/
│   │   └── auth.js                  # Authentication
│   └── utils/
│       └── logger.js                # Logging
├── uploads/                          # Temp PDF storage
├── outputs/                          # Generated content
│   └── job_xxx/                     # Each job gets a folder
│       ├── notes.json               # Study notes
│       ├── narration.mp3            # Audio file
│       └── lesson_video.mp4         # Video file
├── logs/                             # Application logs
├── .env                              # Your config
├── package.json
└── README.md
```

## 🎓 Example Use Cases

1. **Study Materials:** Convert textbook chapters to multimedia content
2. **Lecture Notes:** Transform lecture PDFs into study guides
3. **Documentation:** Create training videos from technical docs
4. **Review Materials:** Generate quick revision notes and audio
5. **Accessibility:** Provide audio/video alternatives for text content

## 🚦 Running Everything Together

Full startup sequence:

```cmd
# Terminal 1 - MongoDB (if not running)
mongod

# Terminal 2 - Content Generation Service
cd services\content-generation-service
npm run dev

# Terminal 3 - Gateway (if using)
cd gateway
npm run dev

# Terminal 4 - Frontend
cd frontend
npm start
```

## 📞 Support

If you encounter issues:

1. Check the logs: `services/content-generation-service/logs/`
2. Verify all dependencies are installed
3. Ensure API keys are valid
4. Test FFmpeg separately: `ffmpeg -version`
5. Check port availability

## 🎉 You're All Set!

Once everything is running:

1. Go to: `http://localhost:3000/education/content-generator`
2. Upload a PDF
3. Wait for processing
4. Download your generated content!

## 📝 Example: Using the Provided PDF

The PDF attached in the conversation ("Redemption of Preference Shares") is perfect for testing:

1. Save the PDF to your computer
2. Upload it through the web interface
3. Wait ~7-10 minutes for processing
4. You'll get:
   - **Notes:** Structured study notes with key points, definitions, and examples
   - **Audio:** ~10-15 minute narration of the content
   - **Video:** Professional video lesson with slides

Enjoy your automated content generation! 🚀
