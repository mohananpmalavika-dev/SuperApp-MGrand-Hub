# SuperApp MGrand Hub 🚀

A modern, scalable microservices-based super app platform with comprehensive business features.

## 🏗️ Architecture Overview

SuperApp MGrand Hub uses a microservices architecture with:
- **12+ independent microservices**
- **Shared MongoDB database** for simplicity
- **Redis** for caching and sessions
- **API Gateway** (Kong) for routing and rate limiting
- **Cloud-native deployment** (Google Cloud Run / AWS ECS)

```
                    ┌─────────────────────┐
                    │   API Gateway       │
                    │   (Kong/Nginx)      │
                    │   Port: 80/443      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼─────┐         ┌─────▼──────┐        ┌─────▼──────┐
   │  Auth    │         │ E-commerce │        │  Payment   │
   │ Service  │         │  Service   │        │  Service   │
   │ :3001    │         │  :3003     │        │  :3004     │
   └────┬─────┘         └─────┬──────┘        └─────┬──────┘
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Shared MongoDB    │
                    │  (Single Database) │
                    └────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Shared Redis     │
                    │   (Cache/Queue)    │
                    └────────────────────┘
```

## 📦 Microservices

### Core Services
1. **auth-service** (Port 3001) - Authentication & JWT management
2. **user-service** (Port 3002) - User profiles & preferences
3. **payment-service** (Port 3004) - Payment processing (Razorpay/Stripe)
4. **notification-service** (Port 3012) - Email, SMS, Push notifications

### Business Services
5. **ecommerce-service** (Port 3003) - Product catalog, orders
6. **classifieds-service** (Port 3005) - Classified listings
7. **food-delivery-service** (Port 3006) - Restaurant & food orders
8. **marketplace-service** (Port 3007) - Real estate, matrimonial, healthcare
9. **business-service** (Port 3008) - Business builder, freelancer
10. **content-service** (Port 3009) - Messaging, diary, social feed
11. **ai-service** (Port 3010) - AI chat, beauty AI, astrology
12. **finance-service** (Port 3011) - Loans, financial services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd SuperApp-MGrand-Hub

# Install dependencies for all services
npm run install:all

# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Start all services in development mode
npm run dev:all

# Or start individual services
cd services/auth-service && npm run dev
```

### Using Docker Compose

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up auth-service payment-service

# View logs
docker-compose logs -f auth-service
```

## 📁 Project Structure

```
SuperApp-MGrand-Hub/
├── services/                    # Microservices
│   ├── auth-service/
│   ├── user-service/
│   ├── payment-service/
│   ├── ecommerce-service/
│   ├── notification-service/
│   ├── classifieds-service/
│   ├── food-delivery-service/
│   ├── marketplace-service/
│   ├── business-service/
│   ├── content-service/
│   ├── ai-service/
│   └── finance-service/
│
├── packages/                    # Shared packages
│   ├── shared/                  # Common utilities
│   │   ├── database/
│   │   ├── redis/
│   │   ├── logger/
│   │   ├── middleware/
│   │   └── utils/
│   └── types/                   # TypeScript types (if using TS)
│
├── gateway/                     # API Gateway
│   └── kong/
│       └── kong.yml
│
├── infrastructure/              # Infrastructure as Code
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   └── terraform/
│
├── frontend/                    # Frontend application (React SPA)
│   ├── src/
│   │   ├── pages/              # All page components
│   │   ├── App.js              # Main app
│   │   └── index.js            # Entry point
│   ├── public/
│   └── package.json
│
├── monitoring/                  # Monitoring & Logging
│   ├── prometheus/
│   ├── grafana/
│   └── loki/
│
├── docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── scripts/                     # Utility scripts
│   ├── deploy-all.sh
│   └── test-all.sh
│
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔧 Service Template Structure

Each microservice follows this consistent structure:

```
service-name/
├── src/
│   ├── config/
│   │   ├── database.js       # DB connection
│   │   ├── redis.js          # Redis connection
│   │   └── env.js            # Environment config
│   ├── routes/
│   │   └── index.js          # API routes
│   ├── controllers/
│   │   └── *.controller.js   # Request handlers
│   ├── services/
│   │   └── *.service.js      # Business logic
│   ├── models/
│   │   └── *.model.js        # Database models
│   ├── middleware/
│   │   ├── auth.js           # Authentication
│   │   ├── validation.js     # Input validation
│   │   └── errorHandler.js   # Error handling
│   ├── utils/
│   │   └── logger.js         # Logging
│   ├── app.js                # Express setup
│   └── server.js             # Entry point
├── tests/
│   └── *.test.js
├── .env.example
├── .dockerignore
├── Dockerfile
├── package.json
└── README.md
```

## 🔐 Authentication Flow

```
1. User → API Gateway → Auth Service
2. Auth Service validates credentials
3. Issues JWT token (7 days expiry)
4. User includes token in subsequent requests
5. Services verify token via shared middleware
```

## 🌐 API Endpoints

### Auth Service (Port 3001)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile

### Payment Service (Port 3004)
- `POST /api/payments/create` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/user/:userId` - Get user payments
- `POST /api/payments/refund` - Process refund

### Ecommerce Service (Port 3003)
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Rate limiting (100 req/min per IP)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ MongoDB injection protection
- ✅ XSS protection
- ✅ HTTPS enforcement

## 📊 Monitoring & Logging

- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Loki** - Log aggregation
- **Winston** - Application logging
- **Health checks** - `/health` endpoint on each service

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/auth-service && npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Google Cloud Run

```bash
# Deploy single service
cd services/auth-service
gcloud run deploy auth-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy all services
npm run deploy:gcloud
```

### AWS ECS

```bash
# Build and push Docker images
npm run docker:build
npm run docker:push

# Deploy via Terraform
cd infrastructure/terraform
terraform init
terraform apply
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 💰 Cost Estimation

### Monthly Costs (Approximate)

**Cloud Run (12 services)**:
- Core services (4): $60/month
- Business services (8): $150/month
**Subtotal**: $210/month

**Infrastructure**:
- MongoDB Atlas (M10): $57/month
- Redis Cloud: $15/month
- API Gateway: $20/month
- Load Balancer: $18/month
**Subtotal**: $110/month

**Monitoring**:
- Cloud Logging: $20/month
- Monitoring: $10/month
**Subtotal**: $30/month

**Total**: ~$350/month

## 📈 Scalability

Each service can scale independently based on load:
- Auto-scaling based on CPU/Memory
- Min instances: 0 (scale to zero)
- Max instances: 10 per service
- Request timeout: 60 seconds

## 🛠️ Development

### Adding a New Service

```bash
# Copy service template
cp -r services/_template services/new-service
cd services/new-service

# Update package.json
# Update service name and port
# Implement routes, controllers, services

# Add to docker-compose.yml
# Add to API Gateway routing
```

### Code Style

- ESLint for linting
- Prettier for formatting
- Husky for pre-commit hooks
- Conventional commits

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Environment Variables

Each service requires:

```env
# Service Config
NODE_ENV=production
PORT=3001
SERVICE_NAME=auth-service

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mgrand-hub
REDIS_URL=redis://user:pass@redis-host:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
PAYMENT_SERVICE_URL=http://payment-service:3004
# ... other services

# External APIs
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
SENDGRID_API_KEY=your-key
```

## 📚 Documentation

### Getting Started
- **[README.md](README.md)** - This file - Project overview
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Local development setup guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference

### Architecture & Design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current project status

### Deployment & Publishing 🚀

#### Render Deployment (Recommended) ⭐
- **[RENDER_QUICK_START.md](RENDER_QUICK_START.md)** - Deploy to Render in 30 minutes!
- **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** - Complete Render deployment guide
- **[DEPLOYMENT_COMPARISON.md](DEPLOYMENT_COMPARISON.md)** - Compare all platforms

#### Google Cloud Run Deployment
- **[PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md)** - Complete GCP deployment guide
- **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - GCP quick commands
- **[scripts/README.md](scripts/README.md)** - Automated deployment scripts

### Service Documentation
- [Auth Service](services/auth-service/README.md)
- [Shared Package](packages/shared/README.md)
- [Gateway](gateway/README.md)

## 📄 License

ISC License

## 👥 Team

MGrand Hub Development Team

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create Issue]
- Email: support@mgrandhub.com
- Documentation: [docs/](docs/)

---

Built with ❤️ by the MGrand Hub Team
