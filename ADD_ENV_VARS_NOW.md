# ⚡ ADD ENVIRONMENT VARIABLES NOW!

## ✅ Build Successful! Just Need Environment Variables

---

## 🎯 Do This (3 Steps):

### 1. Go to Render
- Dashboard → **tutor-service** → **Environment** tab

### 2. Add These Variables

Click **Add Environment Variable** for each:

**MONGODB_URI:**
```
Your MongoDB connection string
Example: mongodb+srv://user:pass@cluster.mongodb.net/tutordb
```

**JWT_SECRET:**
```
Any long random string (32+ characters)
Example: MySecretKey123RandomLongStringHere456
```

**NODE_ENV:**
```
production
```

### 3. Save
- Click **Save Changes**
- Service will auto-redeploy
- Wait ~2 minutes

---

## ✅ Success Signs

Logs will show:
```
✓ MongoDB connected successfully
✓ tutor-service is running on port 10000
✓ Service is live!
```

---

## 📍 Don't Have MongoDB?

**Quick Setup (5 minutes):**

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster (free tier)
4. Create database user
5. Whitelist IP: `0.0.0.0/0`
6. Get connection string
7. Paste in Render

---

**See `SET_ENVIRONMENT_VARIABLES.md` for detailed instructions**

**Add those 3 variables and you're done! 🚀**
