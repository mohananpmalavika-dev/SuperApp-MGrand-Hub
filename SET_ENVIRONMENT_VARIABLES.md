# 🔐 Set Environment Variables in Render

## ✅ Build Successful! Now Configure Environment Variables

Your service built successfully! It's failing because **MongoDB connection string is not set**.

---

## 🎯 Do This Now (2 Minutes)

### 1. Go to Your Service Settings
1. Open Render Dashboard: https://dashboard.render.com
2. Click on **tutor-service**
3. Click **Environment** tab (left sidebar)

### 2. Add These Environment Variables

Click **Add Environment Variable** for each:

#### Required (Service won't start without these):

**Variable 1:**
```
Key:    MONGODB_URI
Value:  mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```
*(Replace with your actual MongoDB connection string)*

**Variable 2:**
```
Key:    JWT_SECRET
Value:  your-super-secret-jwt-key-here-make-it-long-and-random
```
*(Use a strong random string)*

**Variable 3:**
```
Key:    NODE_ENV
Value:  production
```

#### Optional (Recommended):

**Variable 4:**
```
Key:    REDIS_URL
Value:  redis://your-redis-host:6379
```
*(If you have Redis, otherwise skip - service works without it)*

**Variable 5:**
```
Key:    SERVICE_NAME
Value:  tutor-service
```

**Variable 6:**
```
Key:    ALLOWED_ORIGINS
Value:  https://your-frontend.onrender.com,https://your-domain.com
```

### 3. Save
Click **Save Changes** at the bottom

### 4. Redeploy
Service will auto-redeploy, or click **Manual Deploy**

---

## 📋 Where to Get MongoDB URI

### If you don't have MongoDB:

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Sign up** (free tier available)
3. **Create a cluster** (free tier)
4. **Create database user** (Database Access → Add New User)
5. **Whitelist IP**: Network Access → Add IP Address → **0.0.0.0/0** (allow all)
6. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `tutordb`)

### Example MongoDB URI:
```
mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/tutordb?retryWrites=true&w=majority
```

---

## 🔑 Where to Get JWT Secret

Generate a random secret key:

### Option 1 - In Terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Option 2 - Online:
Visit: https://generate-secret.vercel.app/64

### Option 3 - Simple:
Use any long random string (minimum 32 characters):
```
MySecretKey123!@#SuperSecureRandomString$%^&*()
```

---

## ✅ After Adding Variables

### Your service will automatically:
1. ✅ Restart
2. ✅ Connect to MongoDB
3. ✅ Start successfully
4. ✅ Health check passes

### Check Logs:
You'll see:
```
MongoDB connected successfully ✅
Redis connected successfully (or warning if not configured)
tutor-service is running on port 10000 ✅
```

---

## 🧪 Test After Deploy

### Health Check:
```bash
curl https://your-tutor-service.onrender.com/api/tutor/health
```

### Should return:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy",
  "timestamp": "2026-07-19T..."
}
```

---

## 🐛 Troubleshooting

### "MongoDB connection error" persists:
- ✅ Check `MONGODB_URI` is correct
- ✅ Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- ✅ Check database user credentials are correct
- ✅ Check database user has read/write permissions

### "JWT_SECRET not defined":
- ✅ Add `JWT_SECRET` environment variable
- ✅ Make sure it's saved

### Service keeps restarting:
- ✅ Check logs for specific error
- ✅ Verify all required environment variables are set

---

## 📊 Complete Environment Variables List

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `MONGODB_URI` | ✅ Yes | `mongodb+srv://...` | Database connection |
| `JWT_SECRET` | ✅ Yes | `long-random-string` | JWT token signing |
| `NODE_ENV` | ✅ Yes | `production` | Environment mode |
| `REDIS_URL` | ❌ Optional | `redis://host:6379` | Caching (optional) |
| `SERVICE_NAME` | ❌ Optional | `tutor-service` | Service identifier |
| `ALLOWED_ORIGINS` | ❌ Optional | `https://app.com` | CORS configuration |
| `PORT` | ❌ Auto-set | `10000` | Server port (Render sets this) |
| `LOG_LEVEL` | ❌ Optional | `info` | Logging level |

---

## 🎯 Quick Checklist

Before clicking save:

- [ ] `MONGODB_URI` is set with valid connection string
- [ ] `JWT_SECRET` is set with long random string
- [ ] `NODE_ENV` is set to `production`
- [ ] Clicked "Save Changes"
- [ ] Service is redeploying

---

## 🎉 Next Steps

1. **Add environment variables** (see above)
2. **Save changes**
3. **Wait** ~2 minutes for redeploy
4. **Check logs** for success messages
5. **Test** health endpoint
6. **Celebrate!** 🚀

---

**Add those environment variables now and your service will start! 🎉**
