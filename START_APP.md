# 🚀 Quick Start - SuperApp MGrand Hub

## ⚡ Get Started in 5 Minutes

### Step 1: Prerequisites Check
```bash
# Verify installations
node --version    # Should be 18+
docker --version  # Should be 24+
npm --version     # Should be 9+
```

### Step 2: Clone and Setup
```bash
# Clone repository
git clone <your-repo-url>
cd SuperApp-MGrand-Hub

# Copy environment file
copy .env.example .env
```

### Step 3: Configure Environment
Edit `.env` file with these minimum settings:
```env
# Required
MONGO_USER=admin
MONGO_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development

# Optional (for full features)
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
RAZORPAY_KEY_ID=your-razorpay-key
```

### Step 4: Start Backend Services
```bash
# Start all microservices with Docker
docker-compose up -d

# Wait for services to be healthy (30-60 seconds)
docker-compose ps

# View logs to confirm startup
docker-compose logs -f
```

### Step 5: Start Frontend
```bash
# Open new terminal
cd frontend

# Install dependencies (first time only)
npm install

# Start React app
npm start
```

### Step 6: Access Application
🌐 **Open your browser:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Monitoring: http://localhost:3000 (Grafana)

---

## 🎯 What's Available Now

### ✅ Working Services

1. **Authentication** ✓
   - Register new account
   - Login/Logout
   - JWT tokens

2. **User Profile** ✓
   - View/Edit profile
   - Avatar upload
   - Preferences

3. **Payments** ✓
   - Create payments
   - Transaction history
   - Payment verification

4. **Notifications** ✓
   - Email notifications
   - SMS alerts
   - Push notifications

5. **Personal Tutor** 🎙️✓ (WITH VOICE!)
   - Interactive lessons
   - Voice input/output
   - Animated avatar
   - Multi-language support (English, Hindi, Malayalam, Kannada)
   - Quiz generation
   - Progress tracking

6. **Resume Builder** 📝✓
   - Create resumes
   - 6 professional templates
   - PDF export (high quality)
   - DOCX export (editable)
   - Cloud storage
   - Public sharing

---

## 🎮 Try These Features

### 1. Create Account
```
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form and submit
4. Login with credentials
```

### 2. Try Personal Tutor
```
1. From dashboard, click "Personal Tutor"
2. Click "New Session"
3. Choose subject and topic
4. Click microphone icon to use voice
5. Watch animated avatar respond!
```

### 3. Build Resume
```
1. From dashboard, click "Resume Builder"
2. Click "New Resume"
3. Fill in your information
4. Choose a template
5. Export as PDF or DOCX
```

---

## 📊 Service URLs

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend | 3000 | http://localhost:3000 | ✅ |
| API Gateway | 8080 | http://localhost:8080 | ✅ |
| Auth | 3001 | http://localhost:3001 | ✅ |
| User | 3002 | http://localhost:3002 | ✅ |
| Payment | 3004 | http://localhost:3004 | ✅ |
| **Tutor** | **3005** | **http://localhost:3005** | **✅ 🎙️** |
| **Resume** | **3006** | **http://localhost:3006** | **✅ 📝** |
| Notification | 3012 | http://localhost:3012 | ✅ |
| MongoDB | 27017 | mongodb://localhost:27017 | ✅ |
| Redis | 6379 | redis://localhost:6379 | ✅ |
| Prometheus | 9090 | http://localhost:9090 | ✅ |
| Grafana | 3000 | http://localhost:3000 | ✅ |

---

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check if ports are available
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Restart Docker
docker-compose down
docker-compose up -d
```

### MongoDB connection error?
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

### Frontend not loading?
```bash
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start again
npm start
```

### Voice features not working?
- Use Chrome or Edge browser (best support)
- Allow microphone access when prompted
- Ensure HTTPS in production

---

## 🎓 Next Steps

### Learn More
- Read `COMPLETE_PROJECT_GUIDE.md` for full documentation
- Check individual service READMEs in `services/` folders
- Review API endpoints in each service's routes

### Add More Features
The project is modular - you can add:
- Business Tools module
- Job Portal module
- Classifieds module
- Entertainment Hub module

### Deploy to Production
1. Get a cloud server (AWS, Azure, GCP)
2. Set up domain and SSL
3. Update environment variables
4. Deploy with Docker Compose
5. Configure Nginx for your domain

---

## 📞 Need Help?

### Quick Commands
```bash
# Stop everything
docker-compose down

# View all logs
docker-compose logs -f

# Restart single service
docker-compose restart auth-service

# Check service health
curl http://localhost:8080/health
curl http://localhost:3005/api/tutor/health
curl http://localhost:3006/api/resume/health
```

### Check Status
```bash
# See all running containers
docker-compose ps

# Check MongoDB connection
docker exec -it mgrand-mongodb mongosh

# Check Redis
docker exec -it mgrand-redis redis-cli
```

---

## ✨ Features Highlight

### 🎙️ Voice-Enabled Learning
- **Multi-language voice support**
- **Animated tutor avatar**
- **Real-time speech recognition**
- **Text-to-speech narration**
- **Voice commands**
- **Interactive lessons**

### 📝 Professional Resume Builder
- **6 ATS-optimized templates**
- **One-click PDF export**
- **Editable DOCX format**
- **Cloud storage**
- **Version control**
- **Public sharing**

### 🔐 Enterprise Security
- **JWT authentication**
- **Password hashing**
- **Rate limiting**
- **CORS protection**
- **Input validation**

### 📊 Production Ready
- **Microservices architecture**
- **Docker containerization**
- **API Gateway (Nginx)**
- **MongoDB + Redis**
- **Health monitoring**
- **Logging system**

---

## 🎉 You're All Set!

Your SuperApp MGrand Hub is running!

**Next**: Open http://localhost:3000 and start exploring! 🚀

---

**Questions?** Check `COMPLETE_PROJECT_GUIDE.md` or create an issue.

**Happy Building!** 💪
