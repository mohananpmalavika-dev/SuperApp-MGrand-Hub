# Messaging Service

A comprehensive real-time messaging microservice with voice/video calls, file sharing, end-to-end encryption, and AI-powered features.

## 🚀 Features

### Core Messaging
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Message Types**: Text, images, videos, audio, files, polls, location, contacts
- **Chat Types**: Direct chats, group chats, chatrooms
- **Message Operations**: Send, edit, delete, reply, forward
- **Reactions**: Emoji reactions on messages
- **Read Receipts**: Track message read status
- **Typing Indicators**: Real-time typing status
- **Online Status**: User presence tracking

### Voice & Video Calls
- **WebRTC Integration**: Peer-to-peer audio/video calls
- **Call Types**: Voice calls, video calls, group calls
- **Call Features**: Mute, hold, transfer, recording
- **Call Quality**: Automatic quality adjustment
- **Call History**: Track all calls with duration and quality metrics

### File Sharing
- **Media Support**: Images, videos, audio files
- **Document Support**: PDF, DOC, DOCX, TXT, ZIP
- **File Size**: Up to 50MB per file
- **Storage Options**: Local storage or AWS S3
- **Image Optimization**: Automatic compression and thumbnail generation
- **Multiple Uploads**: Send multiple files at once

### Security & Privacy
- **End-to-End Encryption**: AES-256-GCM encryption
- **Message Encryption**: Optional per-message encryption
- **Public Key Encryption**: RSA-2048 for E2E encryption
- **Authentication**: JWT-based authentication
- **Access Control**: Chat-level permissions
- **Block Users**: User blocking functionality

### Advanced Features
- **Search**: Full-text search across messages
- **AI Smart Reply**: Context-aware reply suggestions
- **Message Translation**: Multi-language translation
- **Chat Summarization**: AI-generated chat summaries
- **Scheduled Messages**: Send messages at specific times
- **Message Threads**: Organize conversations with threads
- **Pinned Messages**: Pin important messages
- **Message Forwarding**: Forward messages to other chats
- **Chat Statistics**: Message counts, activity tracking

### Contact Management
- **Contact List**: Manage contacts with nicknames
- **Contact Categories**: Organize contacts (family, friends, work)
- **Favorites**: Mark frequently contacted users
- **Block List**: Blocked users management
- **Contact Sync**: Interaction tracking

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- Redis 6.0+ (for real-time features)
- AWS Account (optional, for S3 storage)

## 🛠️ Installation

1. **Install Dependencies**
```bash
cd services/messaging-service
npm install
```

2. **Environment Configuration**

Create a `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=3007

# Database
MONGODB_URI=mongodb://localhost:27017/superapp-messaging

# Redis (for Socket.IO scaling)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret-key-here
AUTH_SERVICE_URL=http://localhost:3001

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Storage Configuration
STORAGE_TYPE=local  # or 's3'
BASE_URL=http://localhost:8080

# AWS S3 (if STORAGE_TYPE=s3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# AI Features (Optional)
AI_API_URL=https://api.openai.com/v1
AI_API_KEY=your-openai-api-key
```

3. **Generate Encryption Key**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Docker
```bash
docker build -t messaging-service .
docker run -p 3007:3007 --env-file .env messaging-service
```

## 📡 API Endpoints

### Chat Management

#### Create Chat
```http
POST /api/messaging/chats
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "direct",  // or "group", "chatroom"
  "participants": ["userId1", "userId2"],
  "name": "Chat Name",  // for groups
  "description": "Chat description"  // optional
}
```

#### Get User Chats
```http
GET /api/messaging/chats?page=1&limit=20&type=direct
Authorization: Bearer {token}
```

#### Get Chat by ID
```http
GET /api/messaging/chats/:chatId
Authorization: Bearer {token}
```

#### Update Chat
```http
PUT /api/messaging/chats/:chatId
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "New Name",
  "description": "New description",
  "settings": {
    "muteNotifications": false
  }
}
```

#### Delete Chat
```http
DELETE /api/messaging/chats/:chatId
Authorization: Bearer {token}
```

#### Leave Chat
```http
POST /api/messaging/chats/:chatId/leave
Authorization: Bearer {token}
```

### Message Management

#### Send Message
```http
POST /api/messaging/chats/:chatId/messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "Hello, world!",
  "type": "text",  // text, image, video, audio, file, poll, location
  "encrypted": false,
  "replyTo": "messageId"  // optional
}
```

#### Send Message with Files
```http
POST /api/messaging/chats/:chatId/messages
Content-Type: multipart/form-data
Authorization: Bearer {token}

files: [file1, file2, ...]
type: "media"
```

#### Get Chat Messages
```http
GET /api/messaging/chats/:chatId/messages?page=1&limit=50
Authorization: Bearer {token}
```

#### Edit Message
```http
PUT /api/messaging/messages/:messageId
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "Updated message"
}
```

#### Delete Message
```http
DELETE /api/messaging/messages/:messageId?deleteForEveryone=true
Authorization: Bearer {token}
```

#### React to Message
```http
POST /api/messaging/messages/:messageId/react
Content-Type: application/json
Authorization: Bearer {token}

{
  "emoji": "👍"
}
```

#### Mark Messages as Read
```http
POST /api/messaging/chats/:chatId/read
Content-Type: application/json
Authorization: Bearer {token}

{
  "messageIds": ["messageId1", "messageId2"]
}
```

### Search

#### Search Messages
```http
GET /api/messaging/search?query=hello&chatId=xxx&page=1&limit=20
Authorization: Bearer {token}
```

### AI Features

#### Get Smart Reply Suggestions
```http
GET /api/messaging/messages/:messageId/smart-reply
Authorization: Bearer {token}
```

#### Translate Message
```http
POST /api/messaging/messages/:messageId/translate
Content-Type: application/json
Authorization: Bearer {token}

{
  "targetLanguage": "es"
}
```

#### Summarize Chat
```http
GET /api/messaging/chats/:chatId/summarize?limit=100
Authorization: Bearer {token}
```

### Calls

#### Initiate Call
```http
POST /api/messaging/chats/:chatId/calls
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "voice",  // or "video"
  "video": false
}
```

#### Answer Call
```http
POST /api/messaging/calls/:callId/answer
Authorization: Bearer {token}
```

#### End Call
```http
POST /api/messaging/calls/:callId/end
Authorization: Bearer {token}
```

### Contacts

#### Get Contacts
```http
GET /api/messaging/contacts?category=friends&search=john
Authorization: Bearer {token}
```

#### Add Contact
```http
POST /api/messaging/contacts
Content-Type: application/json
Authorization: Bearer {token}

{
  "contactUserId": "userId",
  "nickname": "Johnny",
  "category": "friends"
}
```

#### Block User
```http
POST /api/messaging/contacts/block
Content-Type: application/json
Authorization: Bearer {token}

{
  "blockedUserId": "userId"
}
```

### Media Upload

#### Upload Single File
```http
POST /api/messaging/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [file]
```

### Statistics

#### Get Chat Statistics
```http
GET /api/messaging/chats/:chatId/stats
Authorization: Bearer {token}
```

## 🔌 Socket.IO Events

### Client → Server

#### Connection
```javascript
socket.emit('authenticate', { token: 'jwt-token' });
```

#### Join Chat
```javascript
socket.emit('joinChat', { chatId: 'xxx' });
```

#### Leave Chat
```javascript
socket.emit('leaveChat', { chatId: 'xxx' });
```

#### Send Message
```javascript
socket.emit('sendMessage', {
  chatId: 'xxx',
  content: 'Hello',
  type: 'text'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', { chatId: 'xxx' });
socket.emit('stopTyping', { chatId: 'xxx' });
```

#### WebRTC Signaling
```javascript
socket.emit('call:offer', {
  callId: 'xxx',
  offer: sdpOffer
});

socket.emit('call:answer', {
  callId: 'xxx',
  answer: sdpAnswer
});

socket.emit('call:ice-candidate', {
  callId: 'xxx',
  candidate: iceCandidate
});
```

### Server → Client

#### New Message
```javascript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});
```

#### Message Edited
```javascript
socket.on('messageEdited', (data) => {
  console.log('Message edited:', data);
});
```

#### Message Deleted
```javascript
socket.on('messageDeleted', (data) => {
  console.log('Message deleted:', data);
});
```

#### Typing Events
```javascript
socket.on('typing', (data) => {
  console.log('User typing:', data.userId);
});

socket.on('stopTyping', (data) => {
  console.log('User stopped typing:', data.userId);
});
```

#### User Presence
```javascript
socket.on('userOnline', (userId) => {
  console.log('User online:', userId);
});

socket.on('userOffline', (userId) => {
  console.log('User offline:', userId);
});
```

#### WebRTC Signaling
```javascript
socket.on('call:offer', (data) => {
  // Handle incoming call offer
});

socket.on('call:answer', (data) => {
  // Handle call answer
});

socket.on('call:ice-candidate', (data) => {
  // Handle ICE candidate
});

socket.on('call:ended', (data) => {
  // Handle call ended
});
```

## 🏗️ Architecture

### Models

- **Message**: Text, media, polls, location sharing
- **Chat**: Direct, group, chatroom configurations
- **Contact**: User contacts and relationships
- **Call**: Voice/video call sessions

### Services

- **messaging.service**: Core messaging logic
- **ai.service**: Smart replies, translation, summarization
- **encryption.service**: Message encryption/decryption
- **storage.service**: File upload and storage management

### Controllers

- **messaging.controller**: REST API endpoints

### Socket Events

- **socket.js**: Real-time event handlers

## 🔐 Security Features

### Authentication
- JWT token validation on all endpoints
- Socket.IO authentication middleware
- Token expiration and refresh

### Encryption
- AES-256-GCM for message encryption
- RSA-2048 for public key encryption
- Secure key storage and rotation

### Authorization
- Chat-level access control
- Admin/participant permissions
- Message sender verification

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

## 📊 Performance

### Caching Strategy
- Redis for Socket.IO scaling
- Message caching
- Online user status caching

### Optimization
- Image compression and thumbnails
- Pagination for message lists
- Lazy loading of media
- WebSocket connection pooling

### Scalability
- Horizontal scaling with Redis adapter
- Database indexing on frequently queried fields
- CDN for media delivery (S3)
- Load balancing ready

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Integration Tests
```bash
npm run test:integration
```

## 🐛 Troubleshooting

### Common Issues

**Socket.IO Connection Failed**
- Check CORS configuration
- Verify JWT token is valid
- Ensure Redis is running

**File Upload Failed**
- Check file size limits (50MB max)
- Verify storage configuration (local/S3)
- Check disk space (local) or S3 permissions

**Messages Not Sending**
- Verify MongoDB connection
- Check user is authenticated
- Ensure user is participant in chat

**Encryption Errors**
- Verify ENCRYPTION_KEY is set
- Check key is 32 bytes (64 hex characters)
- Ensure consistent key across restarts

### Debug Mode
```bash
DEBUG=socket.io:* npm run dev
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3007/api/messaging/health
```

### Metrics
- Active connections
- Messages per second
- Average response time
- Error rates

## 🔄 Migration Guide

### From Existing Messaging System

1. Export existing messages:
```javascript
const messages = await OldMessage.find({});
```

2. Transform and import:
```javascript
for (const msg of messages) {
  await Message.create({
    chat: msg.chatId,
    sender: msg.senderId,
    content: msg.text,
    type: 'text',
    createdAt: msg.timestamp
  });
}
```

3. Update chat references
4. Migrate media files to new storage
5. Update frontend Socket.IO endpoints

## 🤝 Contributing

See main project CONTRIBUTING.md

## 📄 License

MIT License - See main project LICENSE

## 🆘 Support

- Documentation: See COMPLETE_PROJECT_GUIDE.md
- Issues: GitHub Issues
- Email: support@mgrand-hub.com

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-17  
**Port**: 3007  
**Status**: Production Ready ✅
