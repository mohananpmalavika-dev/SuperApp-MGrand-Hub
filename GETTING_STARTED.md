# Getting Started with SuperApp MGrand Hub

Complete guide to set up and run the microservices architecture locally.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ or 20+ ([Download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Optional (for production)
- **MongoDB Atlas** account (cloud database)
- **Redis Cloud** account
- **Google Cloud Platform** or **AWS** account

## 🚀 Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd SuperApp-MGrand-Hub

# Copy environment file
copy .env.example .env

# Edit .env with your configuration
notepad .env
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Verify Services

```bash
# Check gateway health
curl http://localhost:8080/health

# Check auth service
curl http://localhost:3001/health

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.runCommand({ping:1})"

# Check Redis
docker-compose exec redis redis-cli ping
```

### 4. Test API Endpoints

```bash
# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\",\"name\":\"Test User\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

## 📁 Project Structure

```
SuperApp-MGrand-Hub/
├── services/               # Microservices
│   ├── auth-service/       # ✅ Complete
│   ├── payment-service/    # 🚧 To be created
│   ├── ecommerce-service/  # 🚧 To be created
│   └── ...
├── packages/
│   └── shared/             # ✅ Complete - Shared utilities
├── gateway/                # ✅ Complete - Nginx API Gateway
├── docker-compose.yml      # ✅ Ready
└── README.md
```

## 🔧 Development Setup

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install shared package dependencies
cd packages/shared
npm install

# Install auth service dependencies
cd ../../services/auth-service
npm install
```

### Run Services Individually

```bash
# Start MongoDB and Redis first
docker-compose up -d mongodb redis

# Run auth service in development mode
cd services/auth-service
npm run dev
```

### Environment Variables

Key variables to configure in `.env`:

```env
# Database
MONGO_URI=mongodb://admin:password@localhost:27017/mgrand-hub?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
```

## 🏗️ Architecture Overview

```
Client → API Gateway (8080) → Microservices
                                ├── Auth Service (3001)
                                ├── Payment Service (3004)
                                ├── Ecommerce Service (3003)
                                └── ...
                                     ↓
                            Shared Database & Redis
```

## 📝 Available Services

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| API Gateway | 8080 | ✅ Ready | Nginx reverse proxy |
| Auth Service | 3001 | ✅ Complete | Authentication & JWT |
| Payment Service | 3004 | 🚧 Planned | Razorpay integration |
| Ecommerce Service | 3003 | 🚧 Planned | Products & orders |
| Notification Service | 3012 | 🚧 Planned | Email/SMS/Push |

## 🧪 Testing

### Test Auth Service

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Password123"
  }'

# Get profile (replace TOKEN)
curl http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Redis Connection Issues

```bash
# Check Redis
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

### Service Won't Start

```bash
# Check service logs
docker-compose logs auth-service

# Rebuild service
docker-compose build auth-service
docker-compose up -d auth-service

# Check port conflicts
netstat -ano | findstr :3001
```

### API Gateway Issues

```bash
# Check Nginx logs
docker-compose logs nginx

# Test direct service access
curl http://localhost:3001/health

# Restart gateway
docker-compose restart nginx
```

## 📚 Next Steps

### For Development

1. **Create remaining services** - Payment, Ecommerce, Notification, etc.
2. **Add unit tests** - Jest tests for each service
3. **Add integration tests** - Test service interactions
4. **Set up CI/CD** - GitHub Actions or GitLab CI

### For Production

1. **Configure production database** - MongoDB Atlas
2. **Set up Redis Cloud** - Managed Redis instance
3. **Configure SSL/TLS** - HTTPS certificates
4. **Deploy to cloud** - Google Cloud Run or AWS ECS
5. **Set up monitoring** - Prometheus + Grafana
6. **Configure logging** - Centralized logging with Loki

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable monitoring and alerts
- [ ] Review environment variables

## 📖 Documentation

- [Architecture Guide](ARCHITECTURE.md) - System design and patterns
- [API Documentation](docs/API.md) - API endpoints and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Shared Package](packages/shared/README.md) - Shared utilities

## 🆘 Support

For issues and questions:
- **GitHub Issues**: [Create Issue]
- **Documentation**: Check docs/ folder
- **Logs**: `docker-compose logs -f`

## 📄 License

ISC License

---

**Built with ❤️ by MGrand Hub Team**
