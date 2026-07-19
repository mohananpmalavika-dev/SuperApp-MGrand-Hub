# 🚀 Fix Render Deployment - Tutor Service

## Problem
The deployment is failing because it's trying to run from the root directory, but there's no `start` script in the root `package.json`.

## ✅ Solution: Deploy Tutor Service Individually

### Step 1: Go to Render Dashboard
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**

### Step 2: Connect Repository
1. Select your GitHub repository: `SuperApp-MGrand-Hub`
2. Click **"Connect"**

### Step 3: Configure Tutor Service

**Basic Settings:**
- **Name**: `tutor-service`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `services/tutor-service` ⚠️ **IMPORTANT**
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Instance Type**: Starter (Free) or Standard
- **Health Check Path**: `/api/tutor/health`

### Step 4: Environment Variables

Click **"Advanced"** and add these environment variables:


```
NODE_ENV=production
PORT=10000
MONGO_URI=your-mongodb-atlas-uri
REDIS_URL=your-redis-cloud-uri
JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=your-openai-key (optional)
USER_SERVICE_URL=https://user-service-xxx.onrender.com
NOTIFICATION_SERVICE_URL=https://notification-service-xxx.onrender.com
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
ENABLE_AI_TUTOR=true
ENABLE_GAMIFICATION=true
```

### Step 5: Get MongoDB URI
1. Go to https://cloud.mongodb.com
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Use format: `mongodb+srv://username:password@cluster.mongodb.net/mgrand-hub`

### Step 6: Get Redis URL (Optional but Recommended)
1. Go to https://redis.com/try-free/
2. Create free account
3. Create database
4. Get connection details
5. Format: `redis://default:password@host:port`

### Step 7: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Check logs for any errors


---

## 🔧 Option 2: Fix Root Package.json (Alternative)

If you want to deploy from root, add a start script:

### Update package.json

Add to the `scripts` section in root `package.json`:

```json
{
  "scripts": {
    "start": "cd services/tutor-service && npm start",
    "build": "cd packages/shared && npm install && cd ../../services/tutor-service && npm install"
  }
}
```

Then in Render settings:
- **Root Directory**: Leave empty (deploy from root)
- **Build Command**: `yarn build`
- **Start Command**: `yarn start`

---

## ✅ Verify Deployment

Once deployed, test the service:

### 1. Check Health Endpoint
```bash
curl https://tutor-service-xxx.onrender.com/api/tutor/health
```

Expected response:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy",
  "timestamp": "2024-01-15T..."
}
```

### 2. Check Service Info
```bash
curl https://tutor-service-xxx.onrender.com/
```


---

## 🐛 Troubleshooting

### Error: "Cannot find module"
**Fix**: Make sure `npm install` runs in build command

### Error: "Connection refused" (MongoDB)
**Fix**: 
1. Check MongoDB URI is correct
2. Whitelist IP: 0.0.0.0/0 in MongoDB Atlas
3. Ensure password doesn't contain special characters (or URL encode them)

### Error: "ECONNREFUSED redis"
**Fix**: 
1. Check Redis URL format
2. Make Redis optional in code (add fallback)
3. Or remove Redis dependency for now

### Error: "Port already in use"
**Fix**: Render uses PORT environment variable automatically (10000)
Make sure your code uses: `process.env.PORT || 3013`

### Service keeps restarting
**Fix**:
1. Check logs in Render dashboard
2. Verify all required env vars are set
3. Test MongoDB connection
4. Make sure health check path is correct

---

## 📊 View Logs

In Render Dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Watch for errors during startup

---

## 🎯 Quick Deploy Checklist

- [ ] Root Directory set to `services/tutor-service`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Health Check Path: `/api/tutor/health`
- [ ] All environment variables added
- [ ] MongoDB Atlas URI configured
- [ ] JWT_SECRET matches auth service
- [ ] Port set to 10000 (Render default)


---

## 🔐 Security Note

**Never commit these to Git:**
- `MONGO_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- Any API keys or passwords

Always set them in Render dashboard only!

---

## 📱 Update Frontend

Once deployed, update frontend to use the new URL:

**frontend/.env.production**:
```env
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-xxx.onrender.com
```

---

## 🚀 Deploy Other Services

Repeat the same process for:
1. **auth-service** (Port 3001) - Deploy first!
2. **user-service** (Port 3002)
3. **payment-service** (Port 3004)
4. **notification-service** (Port 3012)
5. **education-service** (Port 3008)

Each service should:
- Use root directory: `services/SERVICE_NAME`
- Build: `npm install`
- Start: `npm start`
- Share same MONGO_URI and JWT_SECRET

---

## 💰 Cost Estimate

**Render Pricing:**
- Free tier: 1 service, 750 hours/month
- Starter: $7/month per service
- Standard: $25/month per service (recommended for production)

**For 7 services:**
- All Starter: $49/month
- All Standard: $175/month

**Plus:**
- MongoDB Atlas: Free (M0) or $57/month (M10)
- Redis Cloud: Free (30MB) or $10/month (1GB)

**Total estimated: $60-250/month**


---

## 📖 Additional Resources

- [Render Node.js Deploy Guide](https://render.com/docs/deploy-node-express-app)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Environment Variables Best Practices](https://render.com/docs/environment-variables)

---

## ✨ Success!

Once deployed, your tutor service will be available at:
```
https://tutor-service-xxx.onrender.com
```

You can now:
- Create learning sessions via API
- Generate quizzes
- Track progress
- Earn gamification points
- Access from your frontend app

**Next Steps:**
1. Deploy frontend to Vercel/Netlify
2. Update frontend API URLs
3. Test end-to-end flow
4. Add custom domain
5. Enable SSL (automatic with Render)

---

**Happy Deploying! 🎉**
