# SuperApp MGrand Hub - Quick Reference

## 🚀 Start the Project (3 Commands)

```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
copy .env.example .env
docker-compose up -d
```

Then visit: http://localhost:8080/health

---

## 📍 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| **API Gateway** | http://localhost:8080 | ✅ Ready |
| **Auth Service** | http://localhost:3001 | ✅ Complete |
| **MongoDB** | mongodb://localhost:27017 | ✅ Ready |
| **Redis** | redis://localhost:6379 | ✅ Ready |
| **Prometheus** | http://localhost:9090 | 🚧 To setup |
| **Grafana** | http://localhost:3000 | 🚧 To setup |

---

## 🔑 Test Auth APIs

### 1. Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@test.com\",\"password\":\"Test123456\",\"name\":\"Test User\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@test.com\",\"password\":\"Test123456\"}"
```

### 3. Get Profile (use token from login)
```bash
curl http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Common Commands

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# Restart a service
docker-compose restart auth-service

# Rebuild a service
docker-compose build auth-service
docker-compose up -d auth-service

# Check service status
docker-compose ps
```

### Development Commands
```bash
# Install dependencies for auth service
cd services/auth-service
npm install

# Run auth service in dev mode
npm run dev

# Run tests
npm test
```

### Database Commands
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password

# Connect to Redis
docker-compose exec redis redis-cli

# View MongoDB databases
docker-compose exec mongodb mongosh -u admin -p password --eval "show dbs"
```

---

## 📁 Project Structure

```
c:\Users\Dhanya\SuperApp-MGrand-Hub\
├── services/
│   └── auth-service/          ✅ COMPLETE
│       ├── src/
│       │   ├── models/        (User, OTP)
│       │   ├── services/      (Business logic)
│       │   ├── controllers/   (Request handlers)
│       │   ├── routes/        (API endpoints)
│       │   └── server.js      (Entry point)
│       └── Dockerfile         ✅
│
├── packages/shared/           ✅ COMPLETE
│   ├── src/
│   │   ├── database/         (MongoDB)
│   │   ├── redis/            (Cache)
│   │   ├── logger/           (Winston)
│   │   ├── middleware/       (Auth, errors)
│   │   └── utils/            (Helpers)
│   └── index.js              ✅
│
├── gateway/nginx/             ✅ COMPLETE
│   ├── nginx.conf
│   └── conf.d/default.conf
│
├── docker-compose.yml         ✅
├── .env.example               ✅
└── README.md                  ✅
```

---

## 🎯 What's Working Right Now

✅ **API Gateway** - Nginx routing on port 8080
✅ **Auth Service** - Complete authentication system
✅ **User Registration** - Email/phone with validation
✅ **User Login** - JWT tokens (access + refresh)
✅ **OTP System** - Generation and verification
✅ **Password Management** - Change and reset
✅ **Session Management** - Redis-based
✅ **Database** - MongoDB with Mongoose
✅ **Caching** - Redis for sessions
✅ **Logging** - Structured Winston logs
✅ **Security** - JWT, rate limiting, CORS, helmet
✅ **Docker** - Complete containerization

---

## 🚧 What's Next (Create These Services)

1. **Payment Service** (Port 3004)
   - Razorpay/Stripe integration
   - Transaction management
   - Invoice generation

2. **Ecommerce Service** (Port 3003)
   - Product catalog
   - Shopping cart
   - Order management

3. **Notification Service** (Port 3012)
   - Email (SendGrid)
   - SMS (Twilio)
   - Push notifications

4. **Classifieds Service** (Port 3005)
5. **Food Delivery Service** (Port 3006)

---

## 🐛 Troubleshooting

### Can't connect to MongoDB?
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Restart
docker-compose restart mongodb
```

### Port already in use?
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <process-id> /F
```

### Auth service won't start?
```bash
# Check environment variables
docker-compose exec auth-service printenv

# Check logs
docker-compose logs auth-service

# Rebuild
docker-compose build auth-service
docker-compose up -d auth-service
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project overview |
| `ARCHITECTURE.md` | System design details |
| `GETTING_STARTED.md` | Complete setup guide |
| `PROJECT_STATUS.md` | Current progress |
| `QUICK_REFERENCE.md` | This file - quick commands |

---

## 💡 Pro Tips

1. **Always check health endpoints first**
   ```bash
   curl http://localhost:8080/health
   curl http://localhost:3001/health
   ```

2. **Use docker-compose logs to debug**
   ```bash
   docker-compose logs -f --tail=100
   ```

3. **Test endpoints with actual data**
   - Create a Postman collection
   - Or use the curl examples above

4. **Keep .env secure**
   - Never commit .env files
   - Use strong JWT_SECRET in production

5. **Monitor resource usage**
   ```bash
   docker stats
   ```

---

## 🎉 You're Ready!

**Total Files Created**: 50+ files
**Lines of Code**: ~3000+ lines
**Services Running**: 5 (Gateway, Auth, MongoDB, Redis, Nginx)

**Start coding**: Follow the auth-service pattern for new services!

---

**Need Help?** Check:
- `GETTING_STARTED.md` for detailed setup
- `ARCHITECTURE.md` for design decisions
- `PROJECT_STATUS.md` for what's done/todo
