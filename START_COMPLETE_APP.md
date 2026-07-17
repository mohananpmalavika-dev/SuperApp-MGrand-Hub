# 🚀 Complete Application Startup Guide

## Quick Start - Get Everything Running in 5 Minutes!

### Prerequisites Check
```powershell
# Check Node.js (should be 18+)
node --version

# Check Docker (for backend services)
docker --version

# Check npm
npm --version
```

---

## Option 1: Quick Docker Start (Recommended) ⭐

### Step 1: Start Backend Services
```powershell
# From project root
cd c:\Users\Dhanya\SuperApp-MGrand-Hub

# Start all backend services with Docker
docker-compose up -d

# Check if services are running
docker-compose ps
```

**Expected Output:**
```
NAME                          STATUS   PORTS
mongodb                       Up       27017:27017
redis                         Up       6379:6379
auth-service                  Up       3001:3001
user-service                  Up       3002:3002
payment-service              Up       3004:3004
notification-service         Up       3012:3012
nginx-gateway                Up       8080:80
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

**Frontend will open at**: `http://localhost:3000`

### Step 3: Test the Application
1. **Visit**: `http://localhost:3000`
2. **Click**: "Register" button
3. **Create account** with your details
4. **Login** and explore the dashboard!

---

## Option 2: Manual Start (For Development)

### Step 1: Start Infrastructure
```powershell
# Start MongoDB and Redis only
docker-compose up -d mongodb redis

# Wait 10 seconds for startup
```

### Step 2: Start Backend Services Manually
```powershell
# Terminal 1 - Auth Service
cd services\auth-service
npm install  # First time only
npm run dev

# Terminal 2 - User Service
cd services\user-service
npm install  # First time only
npm run dev

# Terminal 3 - Payment Service
cd services\payment-service
npm install  # First time only
npm run dev

# Terminal 4 - Notification Service
cd services\notification-service
npm install  # First time only
npm run dev
```

### Step 3: Start API Gateway
```powershell
# Terminal 5 - Nginx Gateway
cd gateway
docker-compose up
```

### Step 4: Start Frontend
```powershell
# Terminal 6 - React Frontend
cd frontend
npm install  # First time only
npm start
```

---

## 📋 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Primary interface |
| **API Gateway** | http://localhost:8080 | ✅ All API calls |
| **Auth Service** | http://localhost:3001 | ✅ Direct access |
| **User Service** | http://localhost:3002 | ✅ Direct access |
| **Payment Service** | http://localhost:3004 | ✅ Direct access |
| **Notification Service** | http://localhost:3012 | ✅ Direct access |
| **MongoDB** | mongodb://localhost:27017 | ✅ Database |
| **Redis** | redis://localhost:6379 | ✅ Cache |

---

## 🧪 Test Your Setup

### 1. Health Check
```powershell
# Check API Gateway
curl http://localhost:8080/health

# Check individual services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3004/health
curl http://localhost:3012/health
```

### 2. Test Registration
```powershell
# Register a new user
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test@123"
  }'
```

### 3. Test Login
```powershell
# Login
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

---

## 🎯 User Flow Test

### Step-by-Step Testing

#### 1. Launch Page
- ✅ Visit `http://localhost:3000`
- ✅ See 10 service modules
- ✅ See 4 "Active" badges
- ✅ See 6 "Coming Soon" badges

#### 2. Registration
- ✅ Click "Register" button
- ✅ Fill form (name, email, phone, password)
- ✅ Click "Create Account"
- ✅ Auto-redirect to dashboard

#### 3. Dashboard
- ✅ See welcome message with your name
- ✅ See 4 stat cards
- ✅ See all service modules
- ✅ Click on "My Profile"

#### 4. Profile Page
- ✅ View profile information
- ✅ Click "Edit Profile"
- ✅ Update bio, address
- ✅ Click "Save Changes"

#### 5. Payment Page
- ✅ Navigate to Payments
- ✅ See transaction history (empty initially)
- ✅ Click "New Payment"
- ✅ Create test payment

#### 6. Notifications Page
- ✅ Navigate to Notifications
- ✅ See notification stats
- ✅ Filter by type (Email, SMS, Push)

---

## 🐛 Troubleshooting

### Frontend Won't Start
```powershell
# Port 3000 already in use
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && npm start
```

### Backend Services Won't Start
```powershell
# Check if Docker is running
docker ps

# Restart Docker services
docker-compose down
docker-compose up -d
```

### MongoDB Connection Error
```powershell
# Check MongoDB is running
docker ps | findstr mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### CORS Errors
```powershell
# Make sure API Gateway is running
curl http://localhost:8080/health

# Check Nginx logs
docker-compose logs nginx-gateway
```

### API Calls Failing
```powershell
# Check service logs
docker-compose logs auth-service
docker-compose logs user-service

# Check if all services are up
docker-compose ps
```

---

## 📊 Monitoring

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 payment-service
```

### Check Resource Usage
```powershell
# Docker stats
docker stats

# Service-specific stats
docker stats auth-service user-service
```

---

## 🔄 Restart Services

### Restart Everything
```powershell
# Stop all
docker-compose down

# Start all
docker-compose up -d

# Restart frontend
cd frontend
npm start
```

### Restart Specific Service
```powershell
# Restart single service
docker-compose restart auth-service

# View new logs
docker-compose logs -f auth-service
```

---

## 🛑 Stop Everything

### Stop Backend Services
```powershell
# Stop and remove containers
docker-compose down

# Stop but keep containers
docker-compose stop

# Remove volumes (clean database)
docker-compose down -v
```

### Stop Frontend
```
Press Ctrl+C in the terminal running npm start
```

---

## 📝 Environment Configuration

### Frontend Configuration
```env
# frontend/.env
REACT_APP_API_URL=http://localhost:8080
```

### Backend Configuration
```env
# services/auth-service/.env
PORT=3001
MONGO_URI=mongodb://localhost:27017/mgrand-hub
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
```

---

## 🎓 Development Tips

### Hot Reload
- ✅ Frontend: Automatic (React Fast Refresh)
- ✅ Backend: Use `npm run dev` (nodemon)

### Database GUI
```powershell
# MongoDB Compass
# Connect to: mongodb://localhost:27017

# Or use CLI
docker exec -it mongodb mongosh
```

### Redis GUI
```powershell
# Redis Commander
npm install -g redis-commander
redis-commander

# Or use CLI
docker exec -it redis redis-cli
```

---

## 📦 Production Build

### Build Frontend
```powershell
cd frontend
npm run build

# Output in frontend/build/
```

### Build Docker Images
```powershell
# Build all services
docker-compose build

# Build specific service
docker-compose build auth-service
```

---

## 🚀 Quick Commands Reference

### Start Everything
```powershell
# Backend
docker-compose up -d

# Frontend (new terminal)
cd frontend && npm start
```

### Stop Everything
```powershell
# Backend
docker-compose down

# Frontend
# Press Ctrl+C in frontend terminal
```

### View Status
```powershell
# Backend services
docker-compose ps

# Frontend
# Check terminal running npm start
```

### Reset Everything
```powershell
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d
cd frontend && npm start
```

---

## ✅ Success Checklist

- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] All backend services running (`docker-compose ps`)
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can navigate dashboard
- [ ] Can view profile
- [ ] Can access all pages

---

## 🎉 You're All Set!

### What's Working:
✅ **4 Backend Microservices** (Auth, User, Payment, Notification)
✅ **Complete Frontend** with 7 pages
✅ **API Gateway** with routing
✅ **MongoDB Database** for data storage
✅ **Redis Cache** for sessions
✅ **Authentication System** with JWT
✅ **Profile Management**
✅ **Payment System**
✅ **Notification System**

### Start Building:
1. Explore the dashboard
2. Create test data
3. Build new features
4. Add more services

### Need Help?
- Check `FRONTEND_COMPLETE.md` for frontend details
- Check `README.md` for project overview
- Check service-specific READMEs
- Check `GETTING_STARTED.md` for detailed setup

---

**Happy Coding! 🚀**

*Last Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm")*
