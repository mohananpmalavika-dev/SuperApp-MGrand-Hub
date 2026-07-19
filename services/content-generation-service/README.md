# PDF Content Generation Service

An AI-powered microservice that transforms PDF documents into comprehensive educational content including structured notes, audio narration, and engaging video lessons.

## Features

- 📄 **PDF Text Extraction**: Automatically extracts and processes text from uploaded PDF documents
- 📝 **AI-Generated Notes**: Creates structured, comprehensive study notes with:
  - Section summaries
  - Key points
  - Definitions
  - Formulas and equations
  - Examples and illustrations
- 🎙️ **Audio Narration**: Generates natural-sounding audio narration using Edge TTS
- 🎥 **Video Generation**: Creates educational videos with:
  - Visual slides for each section
  - Synchronized audio narration
  - Professional formatting

## Prerequisites

- Node.js (v16 or higher)
- FFmpeg (for video generation)
- API Keys:
  - Groq API Key (for AI processing)
  - Google Gemini API Key (for content generation)

## Installation

1. Navigate to the service directory:
```cmd
cd services\content-generation-service
```

2. Install dependencies:
```cmd
npm install
```

3. Create `.env` file from `.env.example`:
```cmd
copy .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3008
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/content-generation
```

## FFmpeg Installation

### Windows:
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

### Linux:
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### macOS:
```bash
brew install ffmpeg
```

## Usage

### Development Mode:
```cmd
npm run dev
```

### Production Mode:
```cmd
npm start
```

The service will be available at `http://localhost:3008`

## API Endpoints

### Upload PDF
```
POST /api/content-generation/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: { pdf: <file> }

Response: { success: true, jobId: "job_xxx" }
```

### Check Status
```
GET /api/content-generation/status/:jobId
Authorization: Bearer <token>

Response: {
  success: true,
  status: {
    id: "job_xxx",
    status: "processing|completed|failed",
    progress: 75,
    currentStep: "Generating video..."
  }
}
```

### Download Generated Content
```
GET /api/content-generation/download/:jobId/:type
Authorization: Bearer <token>

Types: notes | audio | video
```

### Preview Notes
```
GET /api/content-generation/preview/:jobId/notes
Authorization: Bearer <token>

Response: {
  success: true,
  notes: { ... }
}
```

### List All Jobs
```
GET /api/content-generation/jobs
Authorization: Bearer <token>

Response: {
  success: true,
  jobs: [ ... ]
}
```

### Delete Job
```
DELETE /api/content-generation/:jobId
Authorization: Bearer <token>

Response: { success: true, message: "Content deleted successfully" }
```

## Processing Pipeline

1. **PDF Upload**: User uploads a PDF document
2. **Text Extraction**: Service extracts text content from PDF
3. **AI Analysis**: Gemini AI analyzes and structures the content into sections
4. **Notes Generation**: Creates comprehensive study notes in JSON format
5. **Audio Generation**: Edge TTS converts notes into natural speech
6. **Video Creation**: FFmpeg combines slides and audio into a video
7. **Completion**: All assets are available for download

## File Structure

```
content-generation-service/
├── src/
│   ├── index.js                 # Main server file
│   ├── routes/
│   │   └── contentGeneration.js # API routes
│   ├── services/
│   │   └── PDFContentGenerator.js # Core processing logic
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   └── utils/
│       └── logger.js            # Winston logger
├── uploads/                      # Temporary PDF storage
├── outputs/                      # Generated content storage
├── logs/                         # Application logs
├── package.json
├── .env.example
└── README.md
```

## Output Format

### Notes (JSON)
```json
{
  "title": "Redemption of Preference Shares",
  "generatedAt": "2026-07-20T00:00:00.000Z",
  "sections": [
    {
      "title": "Introduction",
      "summary": "Overview of the topic...",
      "keyPoints": ["Point 1", "Point 2"],
      "definitions": [
        { "term": "Redemption", "definition": "..." }
      ],
      "formulas": ["Formula 1"],
      "examples": ["Example 1"]
    }
  ]
}
```

### Audio
- Format: MP3
- Bitrate: 128kbps
- Voice: en-US-JennyNeural (configurable)

### Video
- Format: MP4
- Resolution: 1280x720 (HD)
- FPS: 30
- Codec: H.264
- Audio: AAC 128kbps

## Limitations

- Maximum PDF size: 50MB
- Processing time: 5-15 minutes (depending on document length)
- Concurrent jobs per server: 3 (configurable)
- Job timeout: 30 minutes

## Error Handling

The service includes comprehensive error handling:
- Invalid file type validation
- File size limits
- API key validation
- Processing failures with detailed error messages
- Automatic cleanup of temporary files

## Monitoring

Logs are stored in the `logs/` directory:
- `error.log`: Error-level logs
- `combined.log`: All application logs

## Security

- JWT-based authentication required for all endpoints
- User isolation (users can only access their own jobs)
- File type validation
- Size limits enforced
- Automatic cleanup of processed files

## Performance

- Async processing prevents blocking
- Background job execution
- Multiple concurrent jobs supported
- Efficient video encoding with FFmpeg

## Troubleshooting

### FFmpeg not found
Ensure FFmpeg is installed and available in system PATH:
```cmd
ffmpeg -version
```

### Out of memory errors
Reduce concurrent job limit in `.env`:
```env
MAX_CONCURRENT_JOBS=1
```

### Slow processing
- Check AI API rate limits
- Verify internet connection
- Monitor system resources

## Future Enhancements

- [ ] Support for more document formats (DOCX, TXT, etc.)
- [ ] Multiple language support for TTS
- [ ] Custom video templates
- [ ] Progress streaming via WebSockets
- [ ] Redis integration for job queue
- [ ] Batch processing
- [ ] AI-generated quizzes
- [ ] Interactive transcript generation

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
