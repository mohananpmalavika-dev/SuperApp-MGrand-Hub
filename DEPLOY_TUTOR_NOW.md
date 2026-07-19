# 🚀 Deploy Tutor Service to Render - DO THIS NOW!

## ⚠️ Your Current Problem

The error happens because Render is trying to deploy from the **ROOT** directory, but your tutor service is in `services/tutor-service`.

## ✅ THE FIX (3 Simple Steps)

### Step 1: Delete Current Deployment
1. Go to https://dashboard.render.com
2. Find the failed service
3. Click **Settings** → **Delete Service**

### Step 2: Create New Service Properly
1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repo: `SuperApp-MGrand-Hub`
3. Click **"Connect"**

### Step 3: Configure Correctly

**Fill in these EXACT values:**

| Field | Value | Why? |
|-------|-------|------|
| **Name** | `tutor-service` | Service identifier |
| **Region** | `Oregon (US West)` | Closest to users |
| **Branch** | `main` | Your code branch |
| **Root Directory** | `services/tutor-service` | ⚠️ **CRITICAL - This was missing!** |
| **Runtime** | `Node` | Auto-detected |
| **Build Command** | `cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install` | Install shared package first, then service |
| **Start Command** | `npm start` | Starts the service |



### Step 4: Add Environment Variables

Click **"Advanced"** button, then **"Add Environment Variable"** for each:

| Key | Value | Where to get it? |
|-----|-------|------------------|
| `NODE_ENV` | `production` | Just type it |
| `PORT` | `10000` | Render's default port |
| `MONGO_URI` | Get from MongoDB Atlas ↓ | See below |
| `JWT_SECRET` | Generate one ↓ | See below |
| `ALLOWED_ORIGINS` | `https://yourdomain.com,http://localhost:3000` | Your frontend URLs |
| `ENABLE_AI_TUTOR` | `true` | Enable AI features |
| `ENABLE_GAMIFICATION` | `true` | Enable points/achievements |

#### How to get MONGO_URI:
1. Go to https://cloud.mongodb.com
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/mgrand-hub`
6. **Important**: In MongoDB Atlas, whitelist IP `0.0.0.0/0` for Render

#### How to generate JWT_SECRET:
Open PowerShell and run:
```powershell
# Generate a secure random string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
Or use this online: https://randomkeygen.com/

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Wait 3-5 minutes
3. Watch the logs



---

## 🎯 What You'll See (Success!)

### Build Logs (Should look like this):
```
==> Cloning from https://github.com/...
==> Using Node.js version 26.5.0
==> Running build command 'npm install'...
    added 145 packages
==> Build successful 🎉
==> Deploying...
==> Your service is live at https://tutor-service-xxx.onrender.com
```

### Test It:
```bash
curl https://tutor-service-xxx.onrender.com/api/tutor/health
```

Should return:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy"
}
```

---

## 🐛 If It Still Fails

### Error: "Cannot find module '@/packages/shared'"
**Fix**: Tutor service needs shared package. Create a custom build command:

**Build Command**:
```bash
cd ../packages/shared && npm install && cd ../services/tutor-service && npm install
```

### Error: "Connection refused" (MongoDB)
**Fix**:
1. Check MongoDB URI is correct
2. In MongoDB Atlas: Network Access → Add IP → Allow 0.0.0.0/0
3. Verify username/password don't have special characters

### Error: "ECONNREFUSED redis"
**Fix**: Redis is optional. You can:
1. Add Redis Cloud (https://redis.com) - Free tier available
2. Or make it optional in code (it's already coded to work without Redis)



---

## 📋 Quick Copy-Paste Values

### Root Directory (MOST IMPORTANT!)
```
services/tutor-service
```

### Build Command (UPDATED - Includes Shared Package!)
```
cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install
```

### Start Command
```
npm start
```

### Health Check Path
```
/api/tutor/health
```

---

## 🎓 After Deployment

Your tutor service will be at:
```
https://tutor-service-[random].onrender.com
```

### Update Frontend
Edit `frontend/.env.production`:
```env
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-xxx.onrender.com
```

### Test API Endpoints
```bash
# Health check
curl https://tutor-service-xxx.onrender.com/api/tutor/health

# Service info
curl https://tutor-service-xxx.onrender.com/

# Create session (needs auth token)
curl -X POST https://tutor-service-xxx.onrender.com/api/tutor/sessions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "JavaScript",
    "topic": "Async Programming",
    "difficulty": "intermediate"
  }'
```

---

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Service spins down after 15 min of inactivity
   - First request after spin-down takes ~30 seconds
   - Upgrade to Starter ($7/mo) to keep it always on

2. **Share MongoDB**:
   - All services can use the same MongoDB cluster
   - Just use the same MONGO_URI for all services
   - Saves money!

3. **JWT Secret**:
   - **MUST** be the same across all services
   - Auth service, user service, tutor service need same secret
   - Otherwise tokens won't validate!

4. **Logs**:
   - Always check logs if something fails
   - Dashboard → Your Service → Logs tab
   - Look for red error messages

---

## 🚀 Deploy Other Services

Once tutor service works, deploy these too:

1. **auth-service** - DEPLOY THIS FIRST! (Port 3001)
2. **user-service** (Port 3002)  
3. **education-service** (Port 3008)
4. **payment-service** (Port 3004)
5. **notification-service** (Port 3012)

Each one: Same process, just change the root directory!

---

## ✅ Success Checklist

- [ ] Deleted old failed deployment
- [ ] Created new service with correct root directory
- [ ] Added all environment variables
- [ ] MongoDB URI is correct and whitelisted 0.0.0.0/0
- [ ] JWT_SECRET generated and added
- [ ] Service deployed successfully
- [ ] Health check returns 200 OK
- [ ] Can access service URL

---

**You got this! 🎉 The key is setting the Root Directory correctly!**

