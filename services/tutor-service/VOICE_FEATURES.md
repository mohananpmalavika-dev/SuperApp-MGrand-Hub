# 🎙️ Voice & Avatar Features - Personal Tutor Service

## Overview

The Personal Tutor Service now includes comprehensive voice interaction and avatar customization features, enabling an immersive, multi-sensory learning experience.

## Features

### 🔊 Voice Features

#### 1. **Text-to-Speech (TTS) Synthesis**
- Multi-language support: English, Hindi, Malayalam, Kannada
- Multiple voice types: Female Soft, Male Calm, Female Warm, Male Energetic
- Adjustable speech rate (0.5x to 2.0x)
- Adjustable pitch (0.5x to 2.0x)
- Automatic lesson narration
- Quiz question audio generation

#### 2. **Speech Recognition (Client-Side)**
- Web Speech API integration
- Voice input for questions and answers
- Auto-send voice transcript option
- Multi-language voice recognition

#### 3. **Voice Preferences**
- Per-user voice settings saved to database
- Auto-play voice responses
- Voice speed and pitch customization
- Language preference

### 🎭 Avatar Features

#### 1. **Avatar Customization**
- Upload custom avatar images (JPG, PNG, GIF, WEBP)
- Image processing with center-crop and resize
- Maximum file size: 5MB
- Automatic optimization to 512x512px

#### 2. **Face Presets System**
- Save up to 20 custom face presets
- Quick-switch between saved avatars
- Preset includes: avatar image, friendly name, creation date
- Delete and rename presets

#### 3. **Animated Avatar**
- Mouth movement animation during speech
- Waveform visualization
- Multiple scenario backgrounds:
  - Room
  - Park
  - Beach
  - Cafe
  - Library
  - Classroom

### 🎯 Tutor Persona

Choose from multiple teaching styles:
- **Supportive**: Caring and encouraging
- **Motivational**: Energetic and inspiring
- **Mindful**: Calm and focused
- **Playful**: Fun and engaging
- **Professional**: Formal and structured

## API Endpoints

### Voice Preferences

```http
GET /api/tutor/voice/preferences
PUT /api/tutor/voice/preferences
```

### Speech Synthesis

```http
POST /api/tutor/voice/speech
POST /api/tutor/voice/speech/lesson
POST /api/tutor/voice/speech/quiz
```

### Avatar Management

```http
POST /api/tutor/voice/avatar
POST /api/tutor/voice/face-presets
DELETE /api/tutor/voice/face-presets/:presetId
```

### Voice Information

```http
GET /api/tutor/voice/voices
```

## Database Models

### VoicePreferences Model

```javascript
{
  userId: ObjectId,
  voice: String, // female-soft, male-calm, female-warm, male-energetic
  language: String, // en, hi, ml, kn
  voiceSpeed: Number, // 0.5 - 2.0
  voicePitch: Number, // 0.5 - 2.0
  autoPlayVoice: Boolean,
  autoSendVoiceTranscript: Boolean,
  avatarUrl: String,
  customAvatarName: String,
  facePresets: Array,
  preferredScenario: String,
  tutorPersona: String,
  enableVoiceInput: Boolean,
  enableVoiceOutput: Boolean,
  showWaveformVisual: Boolean,
  useSubtitles: Boolean,
  highContrastMode: Boolean
}
```

## Usage Examples

### 1. Generate Speech for Text

```javascript
POST /api/tutor/voice/speech
Content-Type: application/json

{
  "text": "Welcome to your learning session!",
  "language": "en",
  "voiceType": "female-soft",
  "voiceSpeed": 1.0,
  "voicePitch": 1.0
}
```

Response:
```json
{
  "success": true,
  "data": {
    "audio": null,
    "mimeType": "audio/mpeg",
    "metadata": {
      "text": "Welcome to your learning session!",
      "language": "en-IN",
      "rate": 0.9,
      "pitch": 1.0,
      "voiceType": "female-soft",
      "useClientSynthesis": true
    }
  }
}
```

### 2. Update Voice Preferences

```javascript
PUT /api/tutor/voice/preferences
Content-Type: application/json

{
  "voice": "female-warm",
  "language": "hi",
  "voiceSpeed": 1.2,
  "autoPlayVoice": true,
  "tutorPersona": "motivational",
  "preferredScenario": "park"
}
```

### 3. Upload Custom Avatar

```javascript
POST /api/tutor/voice/avatar
Content-Type: multipart/form-data

FormData:
  avatar: <image file>
```

Response:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "url": "/uploads/avatars/avatar-123-1234567890.jpg",
    "filename": "avatar-123-1234567890.jpg"
  }
}
```

### 4. Save Face Preset

```javascript
POST /api/tutor/voice/face-presets
Content-Type: application/json

{
  "name": "Professional Look",
  "avatarUrl": "/uploads/avatars/avatar-123-1234567890.jpg",
  "friendName": "Professor Smith"
}
```

## Frontend Integration

### Web Speech API Integration

```javascript
// Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-IN';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('User said:', transcript);
};
recognition.start();

// Speech Synthesis
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-IN';
utterance.rate = 1.0;
utterance.pitch = 1.0;
window.speechSynthesis.speak(utterance);
```

### Animated Avatar Component

```javascript
<div className="avatar-container">
  <div 
    className="avatar" 
    style={{ backgroundImage: `url(${avatarUrl})` }}
  >
    <div className={`mouth ${speaking ? 'animated' : ''}`} />
  </div>
  <div className={`waveform ${speaking ? 'active' : ''}`}>
    <div className="wave" />
  </div>
</div>
```

## Multi-Language Support

### Supported Languages

| Code | Language | Voice Recognition | TTS Support |
|------|----------|-------------------|-------------|
| en   | English  | en-IN             | ✅          |
| hi   | Hindi    | hi-IN             | ✅          |
| ml   | Malayalam| ml-IN             | ✅          |
| kn   | Kannada  | kn-IN             | ✅          |

### Language-Specific Voice Mapping

```javascript
{
  'en': {
    'female-soft': { lang: 'en-IN', pitch: 1.0, rate: 0.9 },
    'male-calm': { lang: 'en-IN', pitch: 0.8, rate: 0.9 },
    // ... more voices
  },
  'hi': {
    'female-soft': { lang: 'hi-IN', pitch: 1.0, rate: 0.9 },
    // ... more voices
  }
  // ... other languages
}
```

## Future Enhancements

### Planned Features

1. **Advanced TTS Integration**
   - Google Cloud Text-to-Speech
   - Amazon Polly
   - Azure Speech Services
   - ElevenLabs for ultra-realistic voices

2. **Real-Time Translation**
   - Translate lessons on-the-fly
   - Multi-language quizzes
   - Cross-language learning support

3. **Voice Analytics**
   - Speech clarity scoring
   - Pronunciation feedback
   - Accent detection and adaptation

4. **3D Animated Avatars**
   - Full facial animation
   - Emotion expression
   - Gesture support
   - Ready Player Me integration

5. **Voice Commands**
   - "Next lesson"
   - "Repeat that"
   - "Show examples"
   - Hands-free navigation

## Accessibility Features

- **Subtitles**: Real-time captions for voice output
- **High Contrast Mode**: Better visibility for low-vision users
- **Adjustable Speech Rate**: Slower/faster speech for comprehension
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Compatible**: ARIA labels and semantic HTML

## Performance Considerations

### Audio Generation
- Client-side synthesis for instant playback
- Server-side synthesis for better quality (when integrated)
- Audio caching for repeated content
- Chunked processing for long text

### Avatar Upload
- Image compression to reduce file size
- Center-crop for consistent aspect ratio
- Lazy loading for preset thumbnails
- CDN-ready URL structure

## Security

- File upload validation (type, size)
- User-specific avatar storage
- Secure avatar URLs
- Rate limiting on speech endpoints
- Input sanitization for TTS text

## Development Setup

### Install Dependencies

```bash
cd services/tutor-service
npm install
```

### Create Upload Directory

```bash
mkdir -p ../../../uploads/avatars
```

### Environment Variables

```env
# Add to .env file
UPLOAD_DIR=./uploads
MAX_AVATAR_SIZE=5242880  # 5MB
```

### Run Service

```bash
npm run dev
```

## Testing

### Test Voice Endpoints

```bash
# Get preferences
curl -X GET http://localhost:3005/api/tutor/voice/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate speech
curl -X POST http://localhost:3005/api/tutor/voice/speech \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, welcome to learning!", "language": "en"}'

# Upload avatar
curl -X POST http://localhost:3005/api/tutor/voice/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@path/to/image.jpg"
```

## Troubleshooting

### Common Issues

1. **Voice not playing**
   - Check browser Web Speech API support
   - Verify autoPlayVoice setting
   - Check browser audio permissions

2. **Avatar upload fails**
   - Verify file size < 5MB
   - Check file type (jpg, png, gif, webp)
   - Ensure uploads directory exists with write permissions

3. **Speech recognition not working**
   - Grant microphone permissions in browser
   - Verify language support for Web Speech API
   - Check HTTPS requirement for production

## Contributing

To add new voice features:

1. Update `VoicePreferences` model if needed
2. Extend `SpeechService` with new functionality
3. Add controller methods in `VoiceController`
4. Create routes in `voice.routes.js`
5. Update this documentation

## License

MIT License - Part of SuperApp MGrand Hub

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainers**: SuperApp Development Team
