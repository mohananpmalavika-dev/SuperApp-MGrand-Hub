# 🚀 Render Manual Deployment - Step by Step

**Deploy each service individually for better control**

---

## ✅ Prerequisites

Before you start:
- [ ] GitHub repository created and code pushed
- [ ] MongoDB Atlas cluster created (M0 free tier)
- [ ] Redis Cloud database created (free tier)
- [ ] Render account created

---

## 📝 Step-by-Step Deployment

### Service 1: Auth Service (Start Here!)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Click "Connect Account" (if first time)
   - Select your GitHub account
   - Find: `SuperApp-MGrand-Hub`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: auth-service
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: services/auth-service
   Build Command: npm install
   Start Command: npm start
   Instance Type: Standard ($25/month) or Starter ($7/month)
   ```

4. **Advanced Settings**
   - Expand "Advanced" section
   - Health Check Path: `/health`
   - Auto-Deploy: Yes

5. **Environment Variables**
   Click "Add Environment Variable" for each:
   ```
   NODE_ENV = production
   PORT = 3001
   MONGO_URI = mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/mgrand-hub
   REDIS_HOST = redis-xxxxx.cloud.redislabs.com
   REDIS_PORT = 6379
   REDIS_PASSWORD = your-redis-password
   JWT_SECRET = [click "Generate" for secure random value]
   JWT_EXPIRE = 7d
   ```

6. **Create Web Service**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Service URL will be: `https://auth-service.onrender.com`

7. **Test It!**
   - Open: `https://auth-service.onrender.com/health`
   - Should see: `{"status":"ok"}`

---

### Service 2: User Service

Repeat the same process with these details:

**Basic Configuration:**
```
Name: user-service
Root Directory: services/user-service
Port: 3002
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3002
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
JWT_SECRET = [same as auth-service - IMPORTANT!]
AUTH_SERVICE_URL = https://auth-service.onrender.com
```

---

### Service 3: Payment Service

**Basic Configuration:**
```
Name: payment-service
Root Directory: services/payment-service
Port: 3004
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3004
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
JWT_SECRET = [same as auth-service]
RAZORPAY_KEY_ID = rzp_test_xxxxx
RAZORPAY_KEY_SECRET = your_test_secret
NOTIFICATION_SERVICE_URL = https://notification-service.onrender.com
```

---

### Service 4: Ecommerce Service

**Basic Configuration:**
```
Name: ecommerce-service
Root Directory: services/ecommerce-service
Port: 3003
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3003
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
JWT_SECRET = [same as auth-service]
PAYMENT_SERVICE_URL = https://payment-service.onrender.com
NOTIFICATION_SERVICE_URL = https://notification-service.onrender.com
USER_SERVICE_URL = https://user-service.onrender.com
```

---

### Service 5: Classifieds Service

**Basic Configuration:**
```
Name: classifieds-service
Root Directory: services/classifieds-service
Port: 3005
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3005
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
JWT_SECRET = [same as auth-service]
PAYMENT_SERVICE_URL = https://payment-service.onrender.com
NOTIFICATION_SERVICE_URL = https://notification-service.onrender.com
USER_SERVICE_URL = https://user-service.onrender.com
```

---

### Service 6: Food Delivery Service

**Basic Configuration:**
```
Name: food-delivery-service
Root Directory: services/food-delivery-service
Port: 3006
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3006
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
JWT_SECRET = [same as auth-service]
PAYMENT_SERVICE_URL = https://payment-service.onrender.com
NOTIFICATION_SERVICE_URL = https://notification-service.onrender.com
USER_SERVICE_URL = https://user-service.onrender.com
```

---

### Service 7: Notification Service

**Basic Configuration:**
```
Name: notification-service
Root Directory: services/notification-service
Port: 3012
```

**Environment Variables:**
```
NODE_ENV = production
PORT = 3012
MONGO_URI = [same as auth-service]
REDIS_HOST = [same as auth-service]
REDIS_PORT = 6379
REDIS_PASSWORD = [same as auth-service]
SENDGRID_API_KEY = SG.xxxxx (get from sendgrid.com)
TWILIO_ACCOUNT_SID = ACxxxxx (get from twilio.com)
TWILIO_AUTH_TOKEN = your_token
TWILIO_PHONE_NUMBER = +1234567890
```

---

## ✅ Verification Checklist

After deploying all services:

### Check Service Status
- [ ] All 7 services show "Live" in Render dashboard
- [ ] No build errors

### Test Health Endpoints
```bash
# Test each service (PowerShell)
Invoke-WebRequest https://auth-service.onrender.com/health
Invoke-WebRequest https://user-service.onrender.com/health
Invoke-WebRequest https://ecommerce-service.onrender.com/health
Invoke-WebRequest https://payment-service.onrender.com/health
Invoke-WebRequest https://classifieds-service.onrender.com/health
Invoke-WebRequest https://food-delivery-service.onrender.com/health
Invoke-WebRequest https://notification-service.onrender.com/health
```

All should return: `{"status":"ok"}`

### Test Authentication
```powershell
# Register a test user
$body = @{
    email = "test@example.com"
    password = "Test123456"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://auth-service.onrender.com/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Login
$loginBody = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://auth-service.onrender.com/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody
```

You should get back a JWT token!

---

## 💡 Pro Tips

### Copy Environment Variables
After deploying auth-service:
1. Go to auth-service → Environment tab
2. Copy `JWT_SECRET`, `MONGO_URI`, etc.
3. Paste into other services
4. This ensures all services use same credentials!

### Use Notes Feature
In each service's Environment tab:
- Click "+ Add Environment Variable"
- Add a note at the top with your service URLs
- Makes it easy to copy-paste for other services

### Deploy in Order
1. **First**: auth-service (no dependencies)
2. **Second**: notification-service (no dependencies)
3. **Third**: user-service (depends on auth)
4. **Fourth**: payment-service (depends on notification)
5. **Last**: ecommerce, classifieds, food (depend on multiple services)

---

## 🔧 Troubleshooting

### Build Failed
**Error**: `npm install` fails

**Fix**:
1. Check logs in Render dashboard
2. Verify `package.json` exists in service directory
3. Check Node version compatibility
4. Try: Build Command = `cd services/SERVICE_NAME && npm install --legacy-peer-deps`

### Service Unhealthy
**Error**: Health check failing

**Fix**:
1. Check logs for errors
2. Verify `/health` endpoint exists in code
3. Check port matches environment variable
4. Verify MONGO_URI and REDIS connection

### Can't Connect to MongoDB
**Error**: Connection timeout

**Fix**:
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow all)
3. Verify database user credentials
4. Check connection string format

### Can't Connect to Redis
**Error**: Redis connection refused

**Fix**:
1. Verify REDIS_HOST is correct
2. Check REDIS_PASSWORD
3. Verify Redis database is running

---

## 📊 Cost Summary

### Starter Plan ($7/service)
```
7 services × $7 = $49/month
MongoDB M0: Free
Redis: Free
──────────────────────
Total: $49/month
```

### Standard Plan ($25/service) - Recommended
```
7 services × $25 = $175/month
MongoDB M10: $57/month
Redis 1GB: $15/month
──────────────────────
Total: $247/month
```

Start with Starter plan, upgrade to Standard when needed!

---

## 🎉 Success!

Once all services are deployed and health checks pass:

**Your URLs:**
```
Auth:         https://auth-service.onrender.com
User:         https://user-service.onrender.com
Ecommerce:    https://ecommerce-service.onrender.com
Payment:      https://payment-service.onrender.com
Classifieds:  https://classifieds-service.onrender.com
Food:         https://food-delivery-service.onrender.com
Notification: https://notification-service.onrender.com
```

**What to do next:**
1. Deploy frontend (Vercel or Render static site)
2. Set up custom domain (optional)
3. Configure monitoring alerts
4. Enable database backups
5. Test all API endpoints

---

**🎊 Congratulations! Your SuperApp is live!** 🚀

*Need help? Check [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) for troubleshooting.*
