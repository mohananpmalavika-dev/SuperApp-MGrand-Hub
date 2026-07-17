# Deployment Quick Reference Card 🚀

**Quick command reference for deploying and managing SuperApp MGrand Hub**

## 🔧 Initial Setup (One-Time)

```bash
# 1. Install Google Cloud SDK
# Windows: https://cloud.google.com/sdk/docs/install

# 2. Login
gcloud auth login

# 3. Create & Set Project
gcloud projects create mgrand-hub-prod
gcloud config set project mgrand-hub-prod

# 4. Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# 5. Create Secrets
echo -n "your-jwt-secret-32-chars" | gcloud secrets create jwt-secret --data-file=-
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/db" | gcloud secrets create mongo-uri --data-file=-
echo -n "rzp_live_xxxxx" | gcloud secrets create razorpay-key-id --data-file=-
echo -n "razorpay_secret" | gcloud secrets create razorpay-key-secret --data-file=-
```

## 🚀 Deploy Single Service

```bash
cd services/auth-service

gcloud run deploy auth-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 3001 \
  --set-env-vars "NODE_ENV=production,PORT=3001" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest"
```

## 📦 Deploy All Services (Automated)

### Windows (PowerShell)
```powershell
cd scripts
.\deploy-to-cloud-run.ps1
```

### Linux/Mac (Bash)
```bash
cd scripts
chmod +x deploy-to-cloud-run.sh
./deploy-to-cloud-run.sh
```

## 🔍 Check Service Status

```bash
# List all services
gcloud run services list --region us-central1

# Describe specific service
gcloud run services describe auth-service --region us-central1

# Get service URL
gcloud run services describe auth-service --region us-central1 --format 'value(status.url)'
```

## 📊 View Logs

```bash
# Stream logs (all services)
gcloud logging tail "resource.type=cloud_run_revision" --format json

# View specific service logs
gcloud logging tail "resource.labels.service_name=auth-service"

# View errors only
gcloud logging tail "resource.type=cloud_run_revision AND severity>=ERROR"

# Last 100 log entries
gcloud logging read "resource.type=cloud_run_revision" --limit 100
```

## 🏥 Health Checks

```bash
# Check single service
curl https://auth-service-xxxxx-uc.a.run.app/health

# Check all services (bash script)
for service in auth-service payment-service ecommerce-service; do
  url=$(gcloud run services describe $service --region us-central1 --format 'value(status.url)')
  echo "Checking $service..."
  curl -s "$url/health" | jq
done
```

## 🔄 Update Service

```bash
# Update environment variable
gcloud run services update auth-service \
  --region us-central1 \
  --set-env-vars "NEW_VAR=value"

# Update scaling
gcloud run services update auth-service \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20

# Update memory/CPU
gcloud run services update auth-service \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2
```

## ⏮️ Rollback

```bash
# List revisions
gcloud run revisions list --service auth-service --region us-central1

# Rollback to previous revision
gcloud run services update-traffic auth-service \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## 🗑️ Delete Service

```bash
# Delete single service
gcloud run services delete auth-service --region us-central1

# Delete all services
gcloud run services list --region us-central1 --format="value(name)" | \
  xargs -I {} gcloud run services delete {} --region us-central1 --quiet
```

## 🔐 Manage Secrets

```bash
# Create secret
echo -n "secret-value" | gcloud secrets create secret-name --data-file=-

# Update secret
echo -n "new-value" | gcloud secrets versions add secret-name --data-file=-

# List secrets
gcloud secrets list

# View secret value
gcloud secrets versions access latest --secret secret-name

# Delete secret
gcloud secrets delete secret-name
```

## 📈 Monitoring & Alerts

```bash
# Create uptime check
gcloud monitoring uptime-checks create auth-health \
  --display-name="Auth Service Health" \
  --url="https://auth-service-xxxxx.run.app/health" \
  --check-interval=60s

# List uptime checks
gcloud monitoring uptime-checks list

# View metrics
gcloud monitoring metrics-descriptors list
```

## 🌐 Custom Domain

```bash
# Map custom domain
gcloud run services update auth-service \
  --region us-central1 \
  --domain api.yourdomain.com

# Verify domain mapping
gcloud run domain-mappings list --region us-central1
```

## 💰 Cost Management

```bash
# View current billing
gcloud billing accounts list

# Set budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=500USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90

# View cost estimate
gcloud run services describe auth-service \
  --region us-central1 \
  --format="table(status.url, spec.template.spec.containers[0].resources)"
```

## 🧪 Testing

```bash
# Test API endpoint
curl -X POST https://auth-service-xxxxx.run.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'

# Load test (using Apache Bench)
ab -n 1000 -c 10 https://auth-service-xxxxx.run.app/health

# Load test (using k6)
k6 run --vus 10 --duration 30s load-test.js
```

## 🐳 Local Docker Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build auth-service
```

## 📱 Frontend Deployment

### Firebase Hosting
```bash
cd frontend
npm run build
firebase login
firebase init hosting
firebase deploy --only hosting
```

### Vercel
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Cloud Run (Static)
```bash
cd frontend
gcloud run deploy frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Database Management

### MongoDB Atlas
```bash
# Connect via mongosh
mongosh "mongodb+srv://cluster.mongodb.net/mgrand-hub" --username admin

# Backup database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/mgrand-hub" --out=backup

# Restore database
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/mgrand-hub" backup/
```

### Redis
```bash
# Connect to Redis Cloud
redis-cli -h redis-xxxxx.cloud.redislabs.com -p 12345 -a your-password

# Check keys
redis-cli KEYS "*"

# Flush all keys (DANGEROUS!)
redis-cli FLUSHALL
```

## 🆘 Emergency Commands

### Service Down
```bash
# Restart service
gcloud run services update auth-service --region us-central1

# Scale up immediately
gcloud run services update auth-service --region us-central1 --min-instances 2
```

### High Error Rate
```bash
# Check recent errors
gcloud logging read "resource.labels.service_name=auth-service AND severity>=ERROR" \
  --limit 50 --format json

# Rollback to previous version
gcloud run services update-traffic auth-service \
  --region us-central1 \
  --to-revisions PREVIOUS_REVISION=100
```

### Database Issues
```bash
# Check MongoDB Atlas status
# Login to: https://cloud.mongodb.com

# Check connection from Cloud Run
gcloud run services update auth-service \
  --region us-central1 \
  --set-env-vars "MONGO_DEBUG=true"
```

---

## 📚 Useful Links

- **Cloud Run Console**: https://console.cloud.google.com/run
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Redis Cloud**: https://app.redislabs.com
- **Cloud Logging**: https://console.cloud.google.com/logs
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring

---

**Keep this reference handy during deployment! 🚀**

For detailed instructions, see: [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md)
