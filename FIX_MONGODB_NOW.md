# 🚨 URGENT: Fix MongoDB Connection on Render

## The Problem
Your tutor-service deployment is failing with:
```
MONGODB_URI environment variable is not set
```

## Quick Fix - Add Environment Variable in Render

### Step 1: Get Your MongoDB Connection String

You need a MongoDB Atlas connection string. If you don't have one:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Sign in** (or create a free account)
3. **Create a Free Cluster** (M0 - Free tier)
4. **Create Database User**:
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `mgrandhub` (or your choice)
   - Password: Generate a secure password (SAVE THIS!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Whitelist Render IPs**:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access From Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   
6. **Get Connection String**:
   - Click "Database" in left sidebar
   - Click "Connect" button on your cluster
   - Click "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **Replace** `<username>` with your database username
   - **Replace** `<password>` with your database password
   - **Add database name** before the `?`:
   ```
   mongodb+srv://mgrandhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mgrand-hub?retryWrites=true&w=majority
   ```

### Step 2: Add to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your tutor-service**
3. **Click "Environment"** in the left sidebar
4. **Click "Add Environment Variable"**
5. **Add these variables**:

   ```
   Key: MONGODB_URI
   Value: mongodb+srv://mgrandhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mgrand-hub?retryWrites=true&w=majority
   ```

   ```
   Key: NODE_ENV
   Value: production
   ```

   ```
   Key: JWT_SECRET
   Value: [Generate a strong random string - at least 32 characters]
   ```

   ```
   Key: REDIS_HOST
   Value: [Your Redis host if you have one, or leave empty for now]
   ```

   ```
   Key: PORT
   Value: 3005
   ```

### Step 3: Save and Deploy

1. **Click "Save Changes"** at the bottom
2. **Render will automatically redeploy** your service
3. **Watch the logs** - you should see:
   ```
   MongoDB Connected: cluster0-xxxxx.mongodb.net
   tutor-service is running on port 3005
   ```

## Generate Strong Secrets

Use this command in your terminal to generate strong secrets:

**Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Or use an online generator:**
- https://randomkeygen.com/ (Use "CodeIgniter Encryption Keys")

## Minimum Required Variables

For the service to start, you MUST set:

1. ✅ **MONGODB_URI** - MongoDB connection string
2. ✅ **NODE_ENV** - Set to `production`
3. ✅ **JWT_SECRET** - Strong random string

## Optional But Recommended

Add these for full functionality:

```
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
OPENAI_API_KEY=sk-your-openai-key
CORS_ORIGIN=https://your-frontend-domain.onrender.com
```

## Verify It Works

After deployment completes:

1. **Check the Logs** - Look for:
   ```
   ✓ MongoDB Connected
   ✓ Redis connected (if configured)
   ✓ tutor-service is running on port 3005
   ```

2. **Test the Health Endpoint**:
   ```
   https://your-service-name.onrender.com/api/tutor/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "service": "tutor-service",
     "timestamp": "2026-07-19T08:30:00.000Z"
   }
   ```

## Troubleshooting

### If MongoDB connection still fails:

1. **Check IP Whitelist** in MongoDB Atlas
   - Must allow `0.0.0.0/0` for Render
   
2. **Verify Connection String**:
   - Must start with `mongodb+srv://`
   - Must include username and password
   - Must include database name before `?`
   - No spaces or special characters unencoded
   
3. **Check Database User Permissions**:
   - User must have "Read and write" access

### If service crashes:

1. **Check Render Logs** for specific error
2. **Verify all required variables** are set
3. **Check for typos** in variable names

## What Happens Next

Once MongoDB is connected:

1. ✅ Service will start successfully
2. ✅ Database collections will be auto-created
3. ✅ API endpoints will be accessible
4. ✅ You can test with Postman/curl

## Next Steps After Fix

1. ✅ Deploy other services (education-service, etc.)
2. ✅ Configure frontend to use your service URLs
3. ✅ Test end-to-end workflows
4. ✅ Set up monitoring and alerts

---

## Quick Reference: Environment Variable Names

**The service expects `MONGODB_URI` (not `MONGO_URI`)**

If you see this in logs:
- ❌ `MONGO_URI is not set` → Variable name is wrong
- ✅ `MONGODB_URI is not set` → Variable not added yet
- ✅ `MongoDB Connected` → SUCCESS!

---

**Need help?** The error logs will show you exactly what's missing. Check Render logs after each deployment.
