# 🏗️ PDF Content Generator - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                    (React + Material-UI)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upload     │  │  Job List    │  │   Preview    │          │
│  │    Area      │  │   & Status   │  │    Notes     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           │                │                  │                  │
└───────────┼────────────────┼──────────────────┼──────────────────┘
            │                │                  │
            ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│                    (Express Proxy)                               │
│                                                                   │
│            Routes: /api/content-generation/*                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONTENT GENERATION SERVICE                          │
│                   (Node.js + Express)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API ROUTES                               │ │
│  │  • POST /upload          • GET /status/:id                 │ │
│  │  • GET /download/:id     • GET /preview/:id                │ │
│  │  • DELETE /:id           • GET /jobs                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AUTHENTICATION MIDDLEWARE                      │ │
│  │                 (JWT Verification)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          PDF CONTENT GENERATOR SERVICE                      │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │ │
│  │  │   Extract   │→ │   Analyze    │→ │  Generate   │       │ │
│  │  │    Text     │  │   with AI    │  │   Content   │       │ │
│  │  └─────────────┘  └──────────────┘  └─────────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐     ┌──────────┐
    │   PDF    │      │  Gemini  │     │   Edge   │
    │  Parser  │      │    AI    │     │   TTS    │
    └──────────┘      └──────────┘     └──────────┘
                                               │
                                               ▼
                                        ┌──────────┐
                                        │  FFmpeg  │
                                        │  Video   │
                                        └──────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  Generated Files │
                                    │  • notes.json    │
                                    │  • audio.mp3     │
                                    │  • video.mp4     │
                                    └──────────────────┘
```

## 🔄 Data Flow

### Upload & Processing Flow

```
User Action                 Backend Process              External APIs
─────────────              ─────────────────            ─────────────

1. Select PDF     →    Upload to server
                       Save to uploads/
                       Create job ID
                            ↓
2. Start          ←    Return job ID
   Processing          Start async task
                            ↓
                       Extract PDF text
                       (pdf-parse)
                            ↓
                       Split into chunks
                       (if large)
                            ↓
                       AI Analysis        →    Gemini API
                       Structure content  ←    Analyze & Extract
                            ↓
                       Generate JSON notes
                       Save notes.json
                            ↓
                       Create script
                            ↓
                       Generate audio     →    Edge TTS
                       Save audio.mp3     ←    Speech synthesis
                            ↓
                       Generate slides
                       (Canvas API)
                            ↓
                       Create video
                       (FFmpeg)
                       Save video.mp4
                            ↓
3. Poll status    ←    Update job status
                       (processing → completed)
                            ↓
4. Download       →    Stream files
   Content        ←    (notes/audio/video)
```

## 📦 Component Architecture

### Frontend Component Structure

```
PDFContentGenerator.js
│
├── State Management
│   ├── uploading (boolean)
│   ├── jobs (array)
│   ├── selectedFile (File)
│   ├── dragActive (boolean)
│   ├── error (string)
│   ├── notesPreview (object)
│   └── previewOpen (boolean)
│
├── Effects
│   ├── useEffect → Fetch jobs on mount
│   └── useEffect → Poll active jobs (every 5s)
│
├── Handlers
│   ├── handleDrag()
│   ├── handleDrop()
│   ├── handleFileChange()
│   ├── handleUpload()
│   ├── handleDownload()
│   ├── handlePreviewNotes()
│   └── handleDelete()
│
└── UI Components
    ├── Upload Area (Drag & Drop)
    ├── Jobs List (Grid of Cards)
    │   ├── Job Card
    │   │   ├── Status Icon
    │   │   ├── File Info
    │   │   ├── Progress Bar
    │   │   └── Action Buttons
    │   └── ...
    └── Notes Preview Dialog
        ├── Sections List
        └── Content Display
```

### Backend Service Structure

```
Content Generation Service
│
├── Express Server (index.js)
│   ├── Middleware
│   │   ├── Helmet (security)
│   │   ├── CORS
│   │   ├── Morgan (logging)
│   │   └── Body Parser
│   │
│   ├── Routes
│   │   └── /api/content-generation
│   │       ├── POST /upload
│   │       ├── GET /status/:id
│   │       ├── GET /download/:id/:type
│   │       ├── GET /preview/:id/notes
│   │       ├── GET /jobs
│   │       └── DELETE /:id
│   │
│   └── Error Handlers
│       ├── 404 Handler
│       └── Global Error Handler
│
├── PDFContentGenerator (service)
│   ├── processDocument()
│   │   ├── extractTextFromPDF()
│   │   ├── generateNotes()
│   │   ├── generateAudio()
│   │   └── generateVideo()
│   │
│   ├── Notes Generation
│   │   ├── splitIntoChunks()
│   │   ├── AI prompt engineering
│   │   └── JSON parsing
│   │
│   ├── Audio Generation
│   │   ├── createNarrationScript()
│   │   └── Edge TTS synthesis
│   │
│   └── Video Generation
│       ├── generateSlides()
│       │   ├── createTitleSlide()
│       │   └── createContentSlide()
│       ├── getAudioDuration()
│       └── createVideoFromSlides()
│
└── Utilities
    ├── Logger (Winston)
    └── Auth Middleware (JWT)
```

## 💾 Data Models

### Job Object

```javascript
{
  id: "job_1721434800000_abc123",
  status: "processing" | "completed" | "failed",
  startedAt: "2026-07-20T00:00:00.000Z",
  completedAt: "2026-07-20T00:15:00.000Z",  // if completed
  userId: "user_id_from_jwt",
  filename: "redemption-of-preference-shares.pdf",
  progress: 75,                               // 0-100
  currentStep: "Generating video...",         // optional
  error: "Error message",                     // if failed
  result: {                                   // if completed
    notes: "/path/to/notes.json",
    audio: "/path/to/audio.mp3",
    video: "/path/to/video.mp4",
    metadata: {
      title: "Document Title",
      sections: 12,
      generatedAt: "2026-07-20T00:15:00.000Z"
    }
  }
}
```

### Notes Structure

```javascript
{
  title: "Main Topic",
  generatedAt: "2026-07-20T00:15:00.000Z",
  sections: [
    {
      title: "Section Title",
      summary: "Brief overview of the section",
      keyPoints: [
        "Important point 1",
        "Important point 2"
      ],
      definitions: [
        {
          term: "Technical Term",
          definition: "Explanation of the term"
        }
      ],
      formulas: [
        "Formula = A + B"
      ],
      examples: [
        "Example 1: Practical application"
      ]
    }
  ]
}
```

## 🔐 Security Architecture

```
Request Flow with Security

1. Client Request
   ├── HTTPS (production)
   └── JWT in Authorization header

2. API Gateway
   ├── CORS validation
   └── Rate limiting (optional)

3. Service Layer
   ├── JWT verification
   │   ├── Token valid?
   │   ├── Token expired?
   │   └── Extract user ID
   │
   ├── User authorization
   │   └── Can user access this job?
   │
   └── Input validation
       ├── File type check
       ├── File size check
       └── Parameter validation

4. Processing Layer
   ├── Isolated job execution
   ├── User data separation
   └── Temporary file cleanup

5. Response
   └── Success/Error with appropriate status
```

## 📊 Scalability Considerations

### Current Architecture (Single Instance)

```
Single Server
├── Upload Queue (Multer)
├── Job Processing (Async)
├── File Storage (Local disk)
└── Concurrent limit: 3 jobs
```

### Scalable Architecture (Future)

```
Load Balancer
    │
    ├── Service Instance 1
    ├── Service Instance 2
    └── Service Instance 3
         │
         ├── Redis Queue
         │   └── Job management
         │
         ├── Cloud Storage (S3/GCS)
         │   └── File storage
         │
         └── MongoDB
             └── Job persistence
```

## 🔄 Processing States

```
Job State Machine

    START
      │
      ▼
  [CREATED]
      │
      ├─→ Upload successful?
      │   ├─ No  → [FAILED]
      │   └─ Yes → [PROCESSING]
      │
      ▼
[PROCESSING]
      │
      ├─→ Extract text
      ├─→ AI analysis
      ├─→ Generate notes (25%)
      ├─→ Generate audio (50%)
      ├─→ Generate video (75%)
      └─→ Save files (100%)
      │
      ├─→ Success?
      │   ├─ Yes → [COMPLETED]
      │   └─ No  → [FAILED]
      │
      ▼
  [COMPLETED]  or  [FAILED]
```

## 🎯 Performance Optimization

### Caching Strategy

```
Request Types & Caching

1. Status Check
   └── In-memory (Map)
       └── No DB query needed

2. File Download
   └── Nginx/CDN (future)
       └── Cache generated files

3. Notes Preview
   └── Read from disk
       └── Could cache in Redis

4. Job List
   └── In-memory for active
       └── DB for historical (future)
```

### Resource Management

```
Resource Allocation

CPU Usage
├── PDF parsing: ~10%
├── AI requests: network I/O
├── Audio generation: ~15%
└── Video generation: ~40%

Memory Usage
├── PDF text: ~5-10 MB
├── Processing: ~200-300 MB per job
└── Video buffer: ~100-200 MB

Disk Usage
├── Uploaded PDF: temporary
├── Generated files:
│   ├── Notes: ~50-200 KB
│   ├── Audio: ~5-10 MB
│   └── Video: ~20-50 MB
└── Auto-cleanup after download
```

## 🛠️ Technology Choices

### Why These Technologies?

**pdf-parse**
- ✅ Pure JavaScript (no native deps)
- ✅ Handles complex PDFs
- ✅ Extracts formatted text

**Google Gemini**
- ✅ Strong content understanding
- ✅ Good at structuring data
- ✅ Free tier available
- ✅ JSON output support

**Edge TTS**
- ✅ Natural voices
- ✅ Free (Microsoft service)
- ✅ Multiple languages
- ✅ Good quality

**FFmpeg**
- ✅ Industry standard
- ✅ Flexible video processing
- ✅ Wide format support
- ✅ Good performance

**Canvas**
- ✅ Server-side rendering
- ✅ No browser needed
- ✅ Text layout control
- ✅ PNG export

## 📈 Monitoring & Observability

```
Logging Layers

Application Logs (Winston)
├── Error log
│   └── Failures, exceptions
├── Combined log
│   └── All activities
└── Console (dev)
    └── Real-time output

Metrics to Track
├── Total PDFs processed
├── Success/failure rate
├── Average processing time
├── API usage (Gemini/Groq)
├── Storage usage
└── Active jobs count

Future: APM Integration
├── New Relic
├── Datadog
└── CloudWatch
```

## 🎨 UI/UX Flow

```
User Journey

1. Landing
   └── See upload area + existing jobs

2. Upload
   ├── Drag & drop PDF
   ├── See upload progress
   └── Job appears in list

3. Processing
   ├── Status: "Processing"
   ├── Progress bar updates
   └── Current step displayed

4. Completion
   ├── Status: "Completed"
   ├── Green checkmark
   └── Download buttons appear

5. Actions
   ├── Preview notes (modal)
   ├── Download notes (JSON)
   ├── Download audio (MP3)
   ├── Download video (MP4)
   └── Delete job
```

---

## 📚 Related Documentation

- [Setup Guide](./PDF_CONTENT_GENERATOR_SETUP.md)
- [Complete Summary](./PDF_CONTENT_GENERATOR_SUMMARY.md)
- [Quick Start](./QUICK_START_PDF_GENERATOR.md)
- [Service README](./services/content-generation-service/README.md)

---

**Architecture Version:** 1.0
**Last Updated:** July 20, 2026
**Status:** Production Ready ✅
