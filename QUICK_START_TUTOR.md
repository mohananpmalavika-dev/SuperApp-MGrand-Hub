# 🚀 Quick Start - Personal Tutor Service

## Get the Tutor Service Running in 5 Minutes!

### Prerequisites Check ✅
```powershell
# Check Node.js
node --version  # Should be 18+

# Check Docker
docker --version
docker-compose --version
```

---

## Option 1: Quick Docker Start (Recommended) ⭐

### Step 1: Start All Services
```powershell
# Navigate to project root
cd c:\Users\Dhanya\SuperApp-MGrand-Hub

# Start everything
docker-compose up -d

# Wait ~30 seconds for services to start
# Check status
docker-compose ps
```

Expected output - all should show "Up (healthy)":
```
mgrand-mongodb            Up (healthy)
mgrand-redis              Up (healthy)
mgrand-auth-service       Up (healthy)
mgrand-user-service       Up (healthy)
mgrand-payment-service    Up (healthy)
mgrand-notification-service Up (healthy)
mgrand-tutor-service      Up (healthy)
mgrand-gateway            Up (healthy)
```

### Step 2: Start Frontend
```powershell
# Open new terminal
cd c:\Users\Dhanya\SuperApp-MGrand-Hub\frontend

# Install dependencies (first time only)
npm install

# Start React app
npm start
```

Frontend opens at: **http://localhost:3000**

### Step 3: Test Personal Tutor
1. **Register/Login** at http://localhost:3000
2. **Click "Personal Tutor"** card on launch page
3. **Start Learning!** 🎓

---

## Option 2: Manual Service Start

### Step 1: Start Infrastructure
```powershell
# Start MongoDB and Redis only
docker-compose up -d mongodb redis

# Wait 10 seconds
timeout 10
```

### Step 2: Start Tutor Service
```powershell
# Terminal 1 - Tutor Service
cd services\tutor-service
npm install  # First time only
npm run dev
```

### Step 3: Start Auth Service (Required)
```powershell
# Terminal 2 - Auth Service
cd services\auth-service
npm install  # First time only
npm run dev
```

### Step 4: Start Frontend
```powershell
# Terminal 3 - Frontend
cd frontend
npm install  # First time only
npm start
```

---

## 🧪 Test the Service

### 1. Health Check
```powershell
# Check if service is running
curl http://localhost:3005/api/tutor/health

# Through API Gateway
curl http://localhost:8080/api/tutor/health
```

Expected Response:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy",
  "timestamp": "2024-01-15T..."
}
```

### 2. Test via Browser

#### A. Access Tutor Dashboard
1. Navigate to: http://localhost:3000
2. Login/Register
3. Click **"Personal Tutor"** (purple card with 🎓 icon)
4. You should see the Tutor Dashboard with:
   - Stats cards (Sessions, Quizzes, Score, Points)
   - Active sessions section
   - Recent quizzes section
   - Learning paths
   - "New Session" button

#### B. Start a Learning Session
1. Click **"New Session"** button
2. Fill in the form:
   - **Subject**: Select "JavaScript"
   - **Topic**: Enter "Promises and Async/Await"
   - **Level**: Select "Intermediate"
   - **Learning Style**: Select "Visual"
   - **Goal**: Enter "Master async programming"
3. Click **"Start Learning"**
4. You should be redirected to the session page

#### C. Take a Quiz
1. From Tutor Dashboard
2. Click **"Take Quiz"** button
3. Fill in quiz parameters
4. Answer questions
5. Submit and view results with feedback

---

## 🎯 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main UI |
| **Tutor Dashboard** | http://localhost:3000/tutor/dashboard | Tutor UI |
| **API Gateway** | http://localhost:8080 | All APIs |
| **Tutor Service** | http://localhost:3005 | Direct access |
| **MongoDB** | mongodb://localhost:27017 | Database |
| **Redis** | redis://localhost:6379 | Cache |

---

## 📊 View Logs

### Docker Logs
```powershell
# All services
docker-compose logs -f

# Tutor service only
docker-compose logs -f tutor-service

# Last 100 lines
docker-compose logs --tail=100 tutor-service
```

### Service Logs
```powershell
# If running manually
# Check the terminal where npm run dev is running
```

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use
```powershell
# Check what's using port 3005
netstat -ano | findstr :3005

# Kill the process
taskkill /PID <PID> /F

# Or change port in .env
# PORT=3006
```

### Issue 2: MongoDB Connection Error
```powershell
# Check MongoDB is running
docker ps | findstr mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

### Issue 3: Frontend Can't Connect
```powershell
# Check REACT_APP_API_URL in frontend/.env
# Should be: REACT_APP_API_URL=http://localhost:8080

# Restart frontend
# Press Ctrl+C in frontend terminal
# npm start
```

### Issue 4: Auth Errors
```powershell
# Make sure auth-service is running
docker-compose ps auth-service

# Check JWT_SECRET is set in .env
# Should match across all services
```

### Issue 5: Service Won't Start
```powershell
# Check dependencies installed
cd services\tutor-service
npm install

# Check .env file exists
dir .env

# If not, copy from example
copy .env.example .env

# Edit .env with your values
notepad .env
```

---

## 🔧 Configuration

### Minimum Required Environment Variables

Create `.env` in project root:
```env
# Database
MONGO_USER=admin
MONGO_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Optional - for external APIs
OPENAI_API_KEY=your-key  # For AI features
SENDGRID_API_KEY=your-key  # For emails
```

Create `services/tutor-service/.env`:
```env
PORT=3005
NODE_ENV=development
MONGO_URI=mongodb://admin:password@localhost:27017/mgrand-hub?authSource=admin
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-this
ENABLE_AI_TUTOR=true
ENABLE_GAMIFICATION=true
```

---

## ✅ Verification Checklist

Run through this checklist to ensure everything works:

- [ ] MongoDB is running and healthy
- [ ] Redis is running and healthy
- [ ] Tutor service is running (port 3005)
- [ ] Auth service is running (port 3001)
- [ ] API Gateway is running (port 8080)
- [ ] Frontend is running (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can login/register
- [ ] Personal Tutor card shows "Active" status
- [ ] Can click Personal Tutor and see dashboard
- [ ] Can click "New Session" button
- [ ] Can fill and submit session form
- [ ] Dashboard shows stats and data

---

## 📈 Next Steps After Setup

### 1. Explore Features
- ✅ Create multiple learning sessions
- ✅ Take quizzes on different topics
- ✅ Track your progress
- ✅ Earn points and achievements
- ✅ View analytics

### 2. Customize
- Add more subjects in NewSessionPage.js
- Add custom question banks
- Customize gamification points
- Add your own learning content

### 3. Extend
- Add video lesson support
- Integrate real AI (OpenAI/Google)
- Add study groups
- Create mobile app
- Add more question types

---

## 🎓 Sample User Journey

### First Time User
1. **Visit** http://localhost:3000
2. **Click** "Register"
3. **Fill** name, email, phone, password
4. **Submit** - Auto redirects to dashboard
5. **Click** "Personal Tutor" card
6. **See** Tutor dashboard (empty initially)
7. **Click** "New Session"
8. **Select** JavaScript / Promises / Intermediate
9. **Submit** - Session starts
10. **Learn** through the lesson
11. **Complete** session
12. **Earn** points (shown in dashboard)
13. **Take** a quiz to test knowledge
14. **View** results and feedback
15. **See** updated stats on dashboard

### Returning User
1. **Visit** http://localhost:3000
2. **Login** with existing account
3. **Click** "Personal Tutor"
4. **See** your stats, active sessions, quiz history
5. **Resume** incomplete sessions
6. **Take** new quizzes
7. **View** learning paths
8. **Check** achievements
9. **See** personalized recommendations

---

## 🎨 UI Features to Try

### Dashboard
- Hover over stat cards (they lift up)
- Click on active sessions to resume
- View recent quiz results with scores
- Check learning streak (if you learn daily)
- See achievements earned
- Click recommendations to act on them

### New Session
- Select different subjects from dropdown
- Type any topic you want to learn
- Choose your difficulty level
- Pick your learning style (visual, auditory, etc.)
- Set a learning goal
- Read the tips section

### Session View (Coming Soon)
- Interactive lesson content
- Progress tracking
- Note-taking
- Bookmarks
- Quiz integration

---

## 📞 Getting Help

### Check Documentation
1. **TUTOR_SERVICE_FINAL.md** - Complete implementation guide
2. **README.md** - Service documentation
3. **TUTOR_SERVICE_COMPLETE.md** - Implementation summary

### Check Logs
```powershell
# Docker logs
docker-compose logs -f tutor-service

# Service logs
# Check terminal where service is running
```

### Common Solutions
- **Restart services**: `docker-compose restart`
- **Rebuild**: `docker-compose up -d --build`
- **Fresh start**: `docker-compose down -v && docker-compose up -d`
- **Check ports**: `netstat -ano | findstr :3005`
- **View containers**: `docker ps -a`

---

## 🎉 You're All Set!

The Personal Tutor service is now running and ready to help users learn!

### What You Have:
✅ Complete backend with 17 API endpoints  
✅ Beautiful frontend with dashboard and session creation  
✅ Gamification system with points and achievements  
✅ Adaptive learning that adjusts to user level  
✅ Quiz system with detailed feedback  
✅ Progress tracking and analytics  
✅ Docker containerization  
✅ Full integration with SuperApp  

### Start Learning!
Open http://localhost:3000 and click **"Personal Tutor"** 🎓

---

**Happy Learning!** 📚✨
