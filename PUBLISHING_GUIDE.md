# Publishing Guide - SuperApp MGrand Hub 🚀

Complete guide to publish your microservices-based SuperApp to production environments.

## 📋 Table of Contents

1. [Pre-Publication Checklist](#pre-publication-checklist)
2. [Deployment Options](#deployment-options)
3. [Cloud Platform Setup](#cloud-platform-setup)
4. [Production Configuration](#production-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Cost Estimation](#cost-estimation)

---

## 🔍 Pre-Publication Checklist

### Security Hardening
- [ ] Change all default passwords in `.env`
- [ ] Generate strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure CORS with specific domains
- [ ] Enable rate limiting on all services
- [ ] Review and update all environment variables
- [ ] Remove debug/development code
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database authentication
- [ ] Configure firewall rules
- [ ] Review API access permissions

### Code Quality
- [ ] Run all tests: `npm test`
- [ ] Run linting: `npm run lint`
- [ ] Fix all critical security vulnerabilities
- [ ] Update dependencies to latest stable versions
- [ ] Remove unused dependencies
- [ ] Add proper error handling
- [ ] Add input validation on all endpoints
- [ ] Review and optimize database queries

### Database & Infrastructure
- [ ] Set up production MongoDB (MongoDB Atlas recommended)
- [ ] Set up production Redis (Redis Cloud recommended)
- [ ] Configure database backups (daily recommended)
- [ ] Set up SSL/TLS for database connections
- [ ] Configure connection pooling
- [ ] Add database indexes for performance
- [ ] Set up CDN for static assets (optional)

### Documentation
- [ ] Update API documentation
- [ ] Create deployment runbook
- [ ] Document environment variables
- [ ] Create incident response plan
- [ ] Document backup/restore procedures

---

## 🌐 Deployment Options

### Option 1: Google Cloud Run (Recommended for Beginners)
**Pros:**
- ✅ Auto-scaling (scale to zero)
- ✅ Pay-per-use pricing
- ✅ Managed infrastructure
- ✅ Easy deployment
- ✅ Built-in load balancing
- ✅ HTTPS included

**Cons:**
- ❌ Cold start latency
- ❌ Request timeout (60s max)

**Best for:** Startups, MVPs, variable traffic

**Monthly Cost:** ~$350-500 for full stack

---

### Option 2: AWS ECS/Fargate
**Pros:**
- ✅ Fully managed containers
- ✅ Integrates with AWS ecosystem
- ✅ Auto-scaling
- ✅ Good for production workloads

**Cons:**
- ❌ More complex setup
- ❌ Higher minimum costs

**Best for:** AWS-first organizations, scalable production apps

**Monthly Cost:** ~$400-600 for full stack

---

### Option 3: DigitalOcean App Platform
**Pros:**
- ✅ Simple deployment from GitHub
- ✅ Affordable pricing
- ✅ Good developer experience
- ✅ Managed databases included

**Cons:**
- ❌ Less flexibility than AWS/GCP
- ❌ Limited regions

**Best for:** Small to medium apps, budget-conscious projects

**Monthly Cost:** ~$200-400 for full stack

---

### Option 4: Self-Hosted VPS (AWS EC2, DigitalOcean Droplets)
**Pros:**
- ✅ Full control
- ✅ Potentially lower costs at scale
- ✅ Flexible configuration

**Cons:**
- ❌ Requires DevOps expertise
- ❌ You manage everything (OS, security, updates)
- ❌ More maintenance overhead

**Best for:** Teams with DevOps expertise, cost optimization at scale

**Monthly Cost:** ~$100-300 for full stack

---

### Option 5: Kubernetes (GKE, EKS, AKS)
**Pros:**
- ✅ Industry standard
- ✅ Highly scalable
- ✅ Multi-cloud portable
- ✅ Advanced orchestration

**Cons:**
- ❌ Complex setup and management
- ❌ Requires Kubernetes expertise
- ❌ Higher operational overhead

**Best for:** Enterprise applications, high-scale systems

**Monthly Cost:** ~$500-1000+ for full stack

---

## 🚀 Cloud Platform Setup

### RECOMMENDED: Google Cloud Run Deployment

#### Step 1: Prerequisites

```bash
# Install Google Cloud SDK
# Windows: https://cloud.google.com/sdk/docs/install
# Or use Cloud Shell (no installation needed)

# Login to Google Cloud
gcloud auth login

# Create new project (or use existing)
gcloud projects create mgrand-hub-prod --name="MGrand Hub Production"

# Set project
gcloud config set project mgrand-hub-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M10 recommended for production)
4. Create database user
5. Whitelist IP addresses (0.0.0.0/0 for Cloud Run)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/mgrand-hub
   ```

#### Step 3: Set Up Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free account
3. Create new database
4. Get connection details:
   ```
   Host: redis-xxxxx.cloud.redislabs.com
   Port: 12345
   Password: your-password
   ```

#### Step 4: Configure Secrets in Google Secret Manager

```bash
# Create secrets for sensitive data
echo -n "your-jwt-secret-here" | gcloud secrets create jwt-secret --data-file=-
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/mgrand-hub" | gcloud secrets create mongo-uri --data-file=-
echo -n "your-razorpay-key-id" | gcloud secrets create razorpay-key-id --data-file=-
echo -n "your-razorpay-secret" | gcloud secrets create razorpay-key-secret --data-file=-
echo -n "your-sendgrid-api-key" | gcloud secrets create sendgrid-api-key --data-file=-
echo -n "redis-password" | gcloud secrets create redis-password --data-file=-
```

#### Step 5: Deploy Each Service

##### Deploy Auth Service

```bash
cd services/auth-service

# Deploy to Cloud Run
gcloud run deploy auth-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 3001 \
  --set-env-vars "NODE_ENV=production,PORT=3001" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest"

# Get service URL
gcloud run services describe auth-service --region us-central1 --format 'value(status.url)'
```

##### Deploy Other Services

Repeat for each service:

```bash
# Payment Service
cd ../payment-service
gcloud run deploy payment-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 3004 \
  --set-env-vars "NODE_ENV=production,PORT=3004" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest,RAZORPAY_KEY_ID=razorpay-key-id:latest,RAZORPAY_KEY_SECRET=razorpay-key-secret:latest"

# Ecommerce Service
cd ../ecommerce-service
gcloud run deploy ecommerce-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 3003 \
  --set-env-vars "NODE_ENV=production,PORT=3003,PAYMENT_SERVICE_URL=https://payment-service-xxxxx.run.app" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest"

# Continue for all other services...
```

#### Step 6: Set Up API Gateway (Cloud Load Balancer)

```bash
# Create a load balancer to route traffic
# Option 1: Use Google Cloud Load Balancer
# Option 2: Deploy custom Nginx gateway
gcloud run deploy api-gateway \
  --source ./gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --min-instances 1 \
  --max-instances 5 \
  --port 80
```

---

## 🔧 Production Configuration

### Production `.env` Template

Create `.env.production`:

```env
# Environment
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mgrand-hub?retryWrites=true&w=majority

# Redis
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=generate-with-openssl-rand-base64-32
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Service URLs (Cloud Run URLs)
AUTH_SERVICE_URL=https://auth-service-xxxxx-uc.a.run.app
USER_SERVICE_URL=https://user-service-xxxxx-uc.a.run.app
PAYMENT_SERVICE_URL=https://payment-service-xxxxx-uc.a.run.app
ECOMMERCE_SERVICE_URL=https://ecommerce-service-xxxxx-uc.a.run.app
NOTIFICATION_SERVICE_URL=https://notification-service-xxxxx-uc.a.run.app

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Notification Services
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Generate Secure Secrets

```bash
# Generate JWT Secret (32 characters)
openssl rand -base64 32

# Generate API Keys
openssl rand -hex 32
```

---

## 📦 Deployment Steps

### Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

# Configuration
PROJECT_ID="mgrand-hub-prod"
REGION="us-central1"

# Services to deploy
SERVICES=(
  "auth-service:3001"
  "user-service:3002"
  "ecommerce-service:3003"
  "payment-service:3004"
  "classifieds-service:3005"
  "food-delivery-service:3006"
  "notification-service:3012"
)

# Set project
gcloud config set project $PROJECT_ID

# Deploy each service
for SERVICE_PORT in "${SERVICES[@]}"; do
  IFS=':' read -r SERVICE PORT <<< "$SERVICE_PORT"
  
  echo "Deploying $SERVICE..."
  
  cd "services/$SERVICE"
  
  gcloud run deploy $SERVICE \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port $PORT \
    --set-env-vars "NODE_ENV=production,PORT=$PORT" \
    --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest"
  
  cd ../..
  
  echo "$SERVICE deployed successfully!"
done

echo "All services deployed!"
```

Make executable and run:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment Checklist

1. **Build Docker Images**
   ```bash
   docker-compose build
   ```

2. **Tag Images for Registry**
   ```bash
   # Google Container Registry
   docker tag auth-service gcr.io/mgrand-hub-prod/auth-service:latest
   docker tag payment-service gcr.io/mgrand-hub-prod/payment-service:latest
   # ... repeat for all services
   ```

3. **Push to Registry**
   ```bash
   docker push gcr.io/mgrand-hub-prod/auth-service:latest
   docker push gcr.io/mgrand-hub-prod/payment-service:latest
   # ... repeat for all services
   ```

4. **Deploy Services**
   - Use Cloud Run console or CLI commands above

5. **Configure DNS**
   - Point your domain to Cloud Run services
   - Set up custom domain in Cloud Run
   - Configure SSL certificates (automatic with Cloud Run)

6. **Test Endpoints**
   ```bash
   # Health checks
   curl https://auth-service-xxxxx.run.app/health
   curl https://payment-service-xxxxx.run.app/health
   
   # Test API
   curl https://api.yourdomain.com/api/auth/health
   ```

---

## 🔍 Post-Deployment

### 1. Verify All Services

```bash
# Create a verification script
#!/bin/bash

SERVICES=(
  "https://auth-service-xxxxx.run.app/health"
  "https://payment-service-xxxxx.run.app/health"
  "https://ecommerce-service-xxxxx.run.app/health"
  # Add all your services
)

for SERVICE in "${SERVICES[@]}"; do
  echo "Checking $SERVICE..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE)
  
  if [ $STATUS -eq 200 ]; then
    echo "✅ $SERVICE is healthy"
  else
    echo "❌ $SERVICE returned status $STATUS"
  fi
done
```

### 2. Set Up Monitoring

#### Google Cloud Monitoring

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime checks for each service
gcloud monitoring uptime-checks create auth-service-health \
  --display-name="Auth Service Health Check" \
  --resource-type=uptime-url \
  --monitored-resource=url \
  --url="https://auth-service-xxxxx.run.app/health" \
  --check-interval=60s
```

#### Set Up Alerts

```bash
# Create alert policy for service health
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Service Down Alert" \
  --condition-display-name="Uptime check failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s
```

### 3. Configure Logging

```bash
# View logs for a service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=auth-service" \
  --limit 50 \
  --format json

# Create log-based metric
gcloud logging metrics create error_count \
  --description="Count of error logs" \
  --log-filter='severity>=ERROR'
```

### 4. Set Up Backup Strategy

#### MongoDB Atlas Backups

1. Go to MongoDB Atlas console
2. Navigate to: Clusters → Backup
3. Enable continuous backup
4. Configure backup schedule:
   - Snapshot every 6 hours
   - Retain snapshots for 30 days
   - Point-in-time recovery enabled

#### Redis Backup

1. In Redis Cloud console
2. Enable automatic backups
3. Schedule daily backups
4. Set retention to 7 days

### 5. Performance Optimization

#### Enable CDN (Optional)

```bash
# Set up Cloud CDN for static assets
gcloud compute backend-services update api-gateway-backend \
  --enable-cdn \
  --global
```

#### Configure Caching

Update Redis configuration for production:
- Increase memory size (1GB minimum)
- Enable persistence
- Configure eviction policy: `allkeys-lru`

#### Database Optimization

```javascript
// Add indexes to frequently queried fields
// In MongoDB Atlas UI or via script:

// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })

// Orders collection
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1 })

// Products collection
db.products.createIndex({ category: 1, createdAt: -1 })
db.products.createIndex({ name: "text", description: "text" })
```

---

## 📊 Monitoring & Maintenance

### Key Metrics to Monitor

1. **Service Health**
   - Response time (p50, p95, p99)
   - Error rate
   - Request rate
   - Uptime percentage

2. **Database Performance**
   - Query response time
   - Connection pool usage
   - Slow queries
   - Storage usage

3. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Network bandwidth
   - Container instances

4. **Business Metrics**
   - Active users
   - API call volume
   - Failed transactions
   - Authentication success rate

### Monitoring Dashboard Setup

#### Option 1: Google Cloud Console

1. Go to Cloud Run → your service
2. Click on "Metrics" tab
3. View built-in metrics:
   - Request count
   - Request latency
   - Container CPU/Memory
   - Error count

#### Option 2: Custom Grafana Dashboard

```bash
# Deploy Grafana on Cloud Run
gcloud run deploy grafana \
  --image grafana/grafana:latest \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --allow-unauthenticated

# Configure Prometheus data source
# Add Google Cloud Monitoring data source
```

### Setting Up Alerts

Create alert channels:

```bash
# Email alert channel
gcloud alpha monitoring channels create \
  --display-name="DevOps Team Email" \
  --type=email \
  --channel-labels=email_address=devops@yourdomain.com

# Slack alert channel (requires webhook)
gcloud alpha monitoring channels create \
  --display-name="Slack Alerts" \
  --type=slack \
  --channel-labels=url=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Recommended Alerts

1. **Service Down Alert**
   - Trigger: Health check fails for 5 minutes
   - Action: Page on-call engineer

2. **High Error Rate**
   - Trigger: Error rate > 5% for 10 minutes
   - Action: Send Slack notification

3. **High Latency**
   - Trigger: p95 latency > 1 second for 10 minutes
   - Action: Send email notification

4. **Database Connection Issues**
   - Trigger: Database connection errors
   - Action: Page on-call engineer

5. **High Memory Usage**
   - Trigger: Memory usage > 90% for 5 minutes
   - Action: Auto-scale or send notification

---

## 💰 Cost Estimation

### Google Cloud Run - Detailed Breakdown

#### Services (12 microservices)

**Pricing Model:**
- $0.00002400/vCPU-second
- $0.00000250/GiB-second
- $0.40 per million requests
- Free tier: 2 million requests/month

**Configuration per service:**
- 0.5 vCPU
- 512 MB memory
- Average: 1000 requests/day/service
- Average request duration: 200ms

**Monthly calculation:**
```
Low Traffic (10K requests/month total):
- Request cost: (10,000 / 1M) × $0.40 = $0.004
- CPU cost: Minimal (under free tier)
- Memory cost: Minimal (under free tier)
Total: ~$5/month

Medium Traffic (100K requests/month):
- Request cost: (100,000 / 1M) × $0.40 = $0.04
- CPU/Memory: ~$50/month
Total: ~$60/month

High Traffic (1M requests/month):
- Request cost: (1M / 1M) × $0.40 = $0.40
- CPU/Memory: ~$200/month
Total: ~$210/month
```

### Infrastructure Costs

#### MongoDB Atlas
| Tier | vCPU | RAM | Storage | Price/Month |
|------|------|-----|---------|-------------|
| M0 (Free) | Shared | 512MB | 512MB | $0 |
| M10 (Starter) | 2 | 2GB | 10GB | $57 |
| M20 (Small Prod) | 2 | 4GB | 20GB | $147 |
| M30 (Production) | 2 | 8GB | 40GB | $320 |

**Recommendation:** Start with M10, upgrade to M20 when needed

#### Redis Cloud
| Plan | Memory | Price/Month |
|------|--------|-------------|
| Free | 30MB | $0 |
| Starter | 1GB | $15 |
| Standard | 5GB | $55 |
| Professional | 10GB | $110 |

**Recommendation:** Start with Starter (1GB)

#### Other Services

| Service | Purpose | Price/Month |
|---------|---------|-------------|
| Cloud Load Balancer | API Gateway | $18 |
| Cloud DNS | Domain management | $0.40 |
| Cloud Logging | Log storage (10GB) | $5 |
| Cloud Monitoring | Metrics | $10 |
| Secret Manager | Secrets storage | $0.06 |
| SendGrid (Email) | 100 emails/day | Free |
| Twilio (SMS) | 100 SMS/month | ~$7 |

### Total Cost Scenarios

#### Scenario 1: MVP / Startup (Low Traffic)
```
Cloud Run Services:        $60/month
MongoDB Atlas (M10):       $57/month
Redis Cloud (1GB):         $15/month
Load Balancer:             $18/month
Monitoring & Logging:      $15/month
Domain & DNS:              $2/month
Email/SMS:                 $7/month
─────────────────────────────────────
Total:                     ~$174/month
```

#### Scenario 2: Growing Product (Medium Traffic)
```
Cloud Run Services:        $150/month
MongoDB Atlas (M20):       $147/month
Redis Cloud (5GB):         $55/month
Load Balancer:             $18/month
Monitoring & Logging:      $25/month
CDN:                       $20/month
Email/SMS:                 $30/month
─────────────────────────────────────
Total:                     ~$445/month
```

#### Scenario 3: Production Scale (High Traffic)
```
Cloud Run Services:        $400/month
MongoDB Atlas (M30):       $320/month
Redis Cloud (10GB):        $110/month
Load Balancer:             $35/month
Monitoring & Logging:      $50/month
CDN:                       $80/month
Email/SMS:                 $100/month
Backups & Storage:         $30/month
─────────────────────────────────────
Total:                     ~$1,125/month
```

### Cost Optimization Tips

1. **Use Cloud Run's Scale-to-Zero**
   - Automatically scales down to 0 when no traffic
   - Only pay for actual usage

2. **Optimize Database Queries**
   - Add proper indexes
   - Use connection pooling
   - Cache frequently accessed data

3. **Implement Caching Strategy**
   - Cache API responses in Redis
   - Use CDN for static assets
   - Browser caching for client-side

4. **Monitor and Optimize**
   - Set up budget alerts
   - Review Cloud Billing reports monthly
   - Identify and remove unused resources

5. **Use Free Tiers**
   - Start with free MongoDB M0 for development
   - Use free Redis Cloud tier for testing
   - Leverage Google Cloud free tier

6. **Regional Selection**
   - Choose region closest to users
   - Use multi-region only when necessary
   - Consider data transfer costs

---

## 🔒 Security Best Practices

### 1. API Security

```javascript
// Enable CORS properly
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting per service
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

### 2. Database Security

```javascript
// Use environment variables
const mongoUri = process.env.MONGO_URI;

// Enable SSL/TLS
const mongoOptions = {
  ssl: true,
  sslValidate: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connection pooling
const pool = {
  poolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
};
```

### 3. Authentication & Authorization

```javascript
// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

// Registration validation
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').trim().isLength({ min: 2, max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 5. Secrets Management

**Never commit secrets to Git!**

Use Google Secret Manager:

```bash
# Store secret
echo -n "my-secret-value" | gcloud secrets create my-secret --data-file=-

# Access in application
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/PROJECT_ID/secrets/${secretName}/versions/latest`,
  });
  return version.payload.data.toString('utf8');
}
```

### 6. HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 🚨 Incident Response Plan

### 1. Service Down

**Symptoms:**
- Health check failing
- High error rate
- No response from service

**Actions:**
1. Check Cloud Run logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" --limit 100
   ```

2. Check service status:
   ```bash
   gcloud run services describe SERVICE_NAME --region REGION
   ```

3. Restart service:
   ```bash
   gcloud run services update SERVICE_NAME --region REGION
   ```

4. Rollback if needed:
   ```bash
   gcloud run services update SERVICE_NAME --to-revision PREVIOUS_REVISION
   ```

### 2. Database Connection Issues

**Symptoms:**
- Connection timeout errors
- "Too many connections" error

**Actions:**
1. Check MongoDB Atlas:
   - Log in to Atlas console
   - Check cluster status
   - Review current connections
   - Check IP whitelist

2. Increase connection pool:
   ```javascript
   mongoose.connect(uri, { poolSize: 20 });
   ```

3. Check for connection leaks:
   ```javascript
   console.log('Active connections:', mongoose.connection.readyState);
   ```

### 3. High Latency

**Symptoms:**
- Slow API responses
- Timeout errors
- User complaints

**Actions:**
1. Check slow queries:
   - MongoDB Atlas Performance Advisor
   - Add missing indexes

2. Check Redis cache:
   ```bash
   redis-cli INFO stats
   ```

3. Scale up service:
   ```bash
   gcloud run services update SERVICE_NAME --max-instances 20
   ```

### 4. Payment Failures

**Symptoms:**
- Payment webhook failures
- Transaction stuck in pending

**Actions:**
1. Check Razorpay webhook logs:
   - Log in to Razorpay dashboard
   - Check webhook delivery status
   - Retry failed webhooks

2. Check payment service logs:
   ```bash
   gcloud logging read "resource.labels.service_name=payment-service AND severity>=ERROR"
   ```

3. Manual verification:
   ```bash
   curl -X POST https://payment-service-url/api/payments/verify \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{"orderId": "ORDER_ID"}'
   ```

---

## 📱 Frontend Deployment

### Deploy React Frontend

#### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
cd frontend
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

#### Option 2: Cloud Run (Static Site)

```bash
# Create Dockerfile in frontend/
FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Deploy
cd frontend
gcloud run deploy frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option 3: Vercel (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure environment variables
5. Deploy automatically

### Frontend Environment Configuration

Create `.env.production` in frontend:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_AUTH_SERVICE_URL=https://auth-service-xxxxx.run.app
REACT_APP_PAYMENT_SERVICE_URL=https://payment-service-xxxxx.run.app
REACT_APP_ECOMMERCE_SERVICE_URL=https://ecommerce-service-xxxxx.run.app

REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
```

---

## 🔄 CI/CD Setup

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main, production ]

env:
  PROJECT_ID: mgrand-hub-prod
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ env.PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Configure Docker
      run: gcloud auth configure-docker
    
    - name: Deploy Auth Service
      run: |
        cd services/auth-service
        gcloud run deploy auth-service \
          --source . \
          --platform managed \
          --region ${{ env.REGION }} \
          --allow-unauthenticated
    
    - name: Deploy Payment Service
      run: |
        cd services/payment-service
        gcloud run deploy payment-service \
          --source . \
          --platform managed \
          --region ${{ env.REGION }} \
          --allow-unauthenticated
    
    # Add more services...
```

### Setup GitHub Actions

1. **Create Service Account**
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions"
   
   gcloud projects add-iam-policy-binding mgrand-hub-prod \
     --member="serviceAccount:github-actions@mgrand-hub-prod.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding mgrand-hub-prod \
     --member="serviceAccount:github-actions@mgrand-hub-prod.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

2. **Create Key**
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@mgrand-hub-prod.iam.gserviceaccount.com
   ```

3. **Add to GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets
   - Add `GCP_SA_KEY` with contents of `key.json`

---

## 📋 Final Checklist

### Pre-Launch
- [ ] All services deployed and healthy
- [ ] Database migrations completed
- [ ] Secrets properly configured
- [ ] SSL/HTTPS working
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Documentation updated
- [ ] Team trained on incident response

### Post-Launch
- [ ] Monitor error rates for 24 hours
- [ ] Check all critical user flows
- [ ] Verify payment processing
- [ ] Test email/SMS notifications
- [ ] Monitor performance metrics
- [ ] Review logs for issues
- [ ] Collect user feedback
- [ ] Plan next iteration

---

## 🎯 Quick Start Commands

### Deploy Everything (Google Cloud Run)

```bash
# 1. Set up project
gcloud config set project mgrand-hub-prod

# 2. Deploy all services
for dir in services/*/; do
  service=$(basename "$dir")
  port=$(grep "PORT" "$dir/src/server.js" | grep -o '[0-9]\+' | head -1)
  
  cd "$dir"
  gcloud run deploy "$service" \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --port "$port"
  cd ../..
done

# 3. Verify deployment
gcloud run services list
```

### Monitor All Services

```bash
# Health check all services
for service in auth-service payment-service ecommerce-service; do
  url=$(gcloud run services describe $service --region us-central1 --format 'value(status.url)')
  echo "Checking $service..."
  curl -s "$url/health" | jq
done
```

### View Logs

```bash
# Tail logs for all services
gcloud logging tail "resource.type=cloud_run_revision" --format json

# View errors only
gcloud logging tail "resource.type=cloud_run_revision AND severity>=ERROR"

# View specific service
gcloud logging tail "resource.labels.service_name=auth-service"
```

---

## 📚 Additional Resources

### Official Documentation
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Redis Cloud Docs](https://docs.redis.com/latest/rc/)
- [Razorpay API Docs](https://razorpay.com/docs/api/)

### Tutorials
- [Deploying Microservices to Cloud Run](https://cloud.google.com/run/docs/quickstarts)
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/getting-started/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [k6](https://k6.io/) - Load testing
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay

---

## 💡 Pro Tips

### 1. Start Small, Scale Gradually
- Begin with 3-4 core services (auth, user, payment, one business service)
- Add more services as you validate product-market fit
- Don't over-engineer early

### 2. Use Managed Services
- MongoDB Atlas instead of self-hosted MongoDB
- Redis Cloud instead of managing Redis
- SendGrid/Twilio instead of self-hosted mail/SMS servers
- Saves time and reduces operational burden

### 3. Monitoring is Critical
- Set up monitoring BEFORE launch
- Monitor what matters: error rate, latency, availability
- Set up alerts for critical issues
- Review metrics weekly

### 4. Cost Management
- Set up billing alerts at $100, $200, $500
- Review Cloud Billing reports monthly
- Use cost forecasting tools
- Optimize unused resources

### 5. Security First
- Never commit secrets to Git
- Use environment variables for all config
- Enable HTTPS everywhere
- Keep dependencies updated
- Run security audits regularly

### 6. Backup Everything
- Database: Daily automated backups
- Code: Version control (Git)
- Configuration: Document everything
- Test restore procedures quarterly

### 7. Documentation
- Keep architecture docs updated
- Document deployment procedures
- Create runbooks for common issues
- Maintain API documentation

---

## 🆘 Getting Help

### Issues and Support

**For deployment issues:**
- Check Cloud Run logs
- Review this guide
- Search Stack Overflow
- Contact GCP Support (if paid plan)

**For application issues:**
- Check service logs
- Review error tracking (Sentry)
- Test API endpoints individually
- Review database queries

**For billing questions:**
- Review Cloud Billing console
- Check usage reports
- Compare with cost estimates
- Contact GCP billing support

---

## 📝 Conclusion

You now have a complete guide to publishing your SuperApp MGrand Hub to production! 

**Recommended Path:**

1. **Week 1:** Set up Google Cloud, MongoDB Atlas, Redis Cloud
2. **Week 2:** Deploy 3-4 core services, test thoroughly
3. **Week 3:** Set up monitoring, alerts, and backups
4. **Week 4:** Deploy remaining services, load test
5. **Week 5:** Soft launch with limited users
6. **Week 6+:** Monitor, iterate, scale

**Remember:**
- Start with MVP deployment
- Monitor everything
- Iterate based on real usage
- Scale when needed, not before

Good luck with your launch! 🚀

---

**Built with ❤️ by MGrand Hub Team**

*Last updated: 2024*
