# 📦 Complete Guide: Store All Content in Google Drive

## 🎯 Overview

This guide shows you how to generate ALL 122 lessons and store them in your Google Drive folder:
**https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw**

## ✅ Prerequisites

Before starting, ensure:
1. ✅ MongoDB is connected (fix the connection issue first - see MONGODB_CONNECTION_TROUBLESHOOTING.md)
2. ✅ Backend service is running on port 3013
3. ✅ API keys configured (Groq + Gemini)
4. ✅ Stable internet connection (for generation + upload)
5. ✅ ~20 GB free space (local temporary storage)
6. ✅ ~20 GB Google Drive space

## 🚀 Quick Start (3 Commands)

### Step 1: Start Backend
```bash
cd services\education-service
npm start
```

### Step 2: Generate All Content for Google Drive
```bash
cd scripts
npm run generate:drive
```

This will:
- Generate all 122 lessons with complete content
- Create organized folder structure
- Save everything locally in `scripts/google-drive-content/`
- Take approximately **3-4 hours** to complete
- Create a manifest.json with complete index

### Step 3: Upload to Google Drive
```bash
npm run upload:drive
```

This will:
- Open your Google Drive folder in browser
- Open the local content folder in File Explorer
- You drag & drop the folder from Explorer to Drive
- Upload takes **30-60 minutes** depending on internet speed

## 📁 Generated Folder Structure

```
google-drive-content/
├── CA-Foundation/
│   ├── lesson-001-introduction-to-accounting.json
│   ├── lesson-002-journal-entries-fundamentals.json
│   ├── lesson-003-ledger-and-trial-balance.json
│   └── ... (40 total lessons)
├── JEE-Physics/
│   ├── lesson-001-kinematics-motion-in-one-dimension.json
│   ├── lesson-002-laws-of-motion.json
│   └── ... (30 total lessons)
├── CBSE-Class-10/
│   ├── lesson-001-real-numbers.json
│   ├── lesson-002-polynomials.json
│   └── ... (16 total lessons)
├── IAS-Prelims/
│   ├── lesson-001-indian-polity-constitution-basics.json
│   ├── lesson-002-indian-history-ancient-india.json
│   └── ... (36 total lessons)
├── manifest.json (complete index of all content)
└── README.md (documentation)
```

## 📊 Each Lesson JSON Contains

```json
{
  "_id": "unique-lesson-id",
  "title": "Lesson Title",
  "subject": "Subject Name",
  "level": "Difficulty Level",
  "content": "2000-3000 words of AI-generated content",
  "audioUrl": "URL or file path to 15-20 min audio",
  "videoUrl": "URL to AI-generated video",
  "animations": [
    {
      "type": "concept-animation",
      "description": "...",
      "svgCode": "...",
      "duration": 30
    }
    // ... 5 animations per lesson
  ],
  "questions": [
    {
      "question": "MCQ question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
    // ... 10-20 MCQs per lesson
  ],
  "summary": "Brief lesson summary",
  "keyPoints": ["Point 1", "Point 2", ...],
  "difficulty": "Easy/Medium/Hard",
  "estimatedDuration": "15-20 minutes"
}
```

## 🔄 Alternative: Upload Individual Tracks

If you want to generate and upload one track at a time (to save local storage):

### CA Foundation Only
```bash
cd scripts
node generate-ca-foundation.js
# Then drag CA-Foundation folder to Drive
```

### JEE Physics Only
```bash
node generate-jee-physics.js
# Then drag JEE-Physics folder to Drive
```

### CBSE Class 10 Only
```bash
node generate-cbse-10.js
# Then drag CBSE-Class-10 folder to Drive
```

### IAS Prelims Only
```bash
node generate-ias-prelims.js
# Then drag IAS-Prelims folder to Drive
```

## 📱 Using Content from Google Drive

Once uploaded, your application can:

1. **Read the manifest.json** to get the complete index
2. **Access individual lessons** by constructing Drive URLs
3. **Stream content** directly from Google Drive
4. **Use the public share link** to make content accessible

### Example: Accessing Content

```javascript
const DRIVE_FOLDER_ID = '1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';
const MANIFEST_URL = `https://drive.google.com/uc?id=${MANIFEST_FILE_ID}`;

// Fetch manifest
const manifest = await fetch(MANIFEST_URL).then(r => r.json());

// Access specific lesson
const lesson = manifest.tracks['CA-Foundation'][0];
const lessonURL = `https://drive.google.com/uc?id=${lesson.fileId}`;
```

## ⏱️ Time Estimates

| Task | Duration | Notes |
|------|----------|-------|
| Generate all 122 lessons | 3-4 hours | Depends on API speed |
| Upload to Google Drive | 30-60 min | Depends on internet |
| **Total Time** | **4-5 hours** | Can run overnight |

## 💾 Storage Estimates

| Content Type | Size per Lesson | Total (122 lessons) |
|--------------|-----------------|---------------------|
| Text Content | ~50 KB | ~6 MB |
| Audio Files | ~15 MB | ~1.8 GB |
| Video Metadata | ~5 KB | ~600 KB |
| Animations (SVG) | ~50 KB | ~6 MB |
| MCQ Data | ~20 KB | ~2.4 MB |
| **Total** | **~15 MB** | **~18 GB** |

## 🎯 What Happens During Generation?

For each of the 122 lessons:
1. ✅ Call Groq API for text content (2000-3000 words)
2. ✅ Call Gemini API for complex explanations
3. ✅ Generate Edge TTS audio (15-20 min voice narration)
4. ✅ Create D-ID video URL (AI avatar video)
5. ✅ Generate 5 SVG animations
6. ✅ Generate 10-20 MCQ questions with explanations
7. ✅ Save everything to local JSON file
8. ✅ Update manifest with metadata

## 🚨 Troubleshooting

### MongoDB Connection Failed
See `MONGODB_CONNECTION_TROUBLESHOOTING.md` for fixes.

### Generation Taking Too Long
- Each lesson takes ~1-2 minutes
- 122 lessons = 2-4 hours total
- This is normal!

### Upload Failed
- Check Google Drive space
- Try uploading one track at a time
- Use Google Drive desktop app for large uploads

### Out of Local Space
- Generate one track at a time
- Upload immediately after generation
- Delete local files after successful upload

## 🎉 After Upload Complete

1. ✅ Content is stored in Google Drive
2. ✅ Accessible via public share link
3. ✅ Can be integrated with your application
4. ✅ No backend storage needed
5. ✅ Can delete local copies to free space

## 📞 Next Steps

After content is in Google Drive:
1. Update your application to read from Google Drive
2. Use the manifest.json to index all content
3. Implement content streaming from Drive
4. Test with a few lessons first
5. Deploy your application!

---

**Ready to start?** Follow the Quick Start section at the top! 🚀
