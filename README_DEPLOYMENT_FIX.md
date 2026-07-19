# 🚨 URGENT FIX - Render Deployment Error

## Your Error
```
error Command "start" not found.
```

## The Problem
You're deploying from the **root directory**, but your services are in subdirectories.

## The One-Line Fix
**Set Root Directory to: `services/tutor-service`**

---

## 📚 Documentation Created for You

I've created 3 guides to help you:

### 1. 🚀 DEPLOY_TUTOR_NOW.md
**Quick action guide** - Follow this step-by-step to deploy now.

### 2. 📸 RENDER_FIX_SCREENSHOT_GUIDE.md  
**Visual guide** - See exactly what each setting should look like.

### 3. 🔧 RENDER_TUTOR_SERVICE_FIX.md
**Complete reference** - Troubleshooting, environment variables, everything.

---

## ⚡ Quick Start (30 seconds)

1. Go to https://dashboard.render.com
2. Delete the failed deployment
3. Click **New +** → **Web Service**
4. **Root Directory**: `services/tutor-service` ⚠️
5. **Build**: `npm install`
6. **Start**: `npm start`
7. Add environment variables (see guides)
8. Deploy!

---

## 🎯 Critical Settings

```yaml
Root Directory:    services/tutor-service  # ⚠️ MUST SET THIS!
Build Command:     cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install
Start Command:     npm start
Health Check Path: /api/tutor/health
```

---

## 📖 Read These Files

1. **DEPLOY_TUTOR_NOW.md** - Start here!
2. **RENDER_FIX_SCREENSHOT_GUIDE.md** - Visual guide
3. **RENDER_TUTOR_SERVICE_FIX.md** - Full details

---

## ✅ After Deployment

Your service will be at:
```
https://tutor-service-[random].onrender.com
```

Test it:
```bash
curl https://tutor-service-xxx.onrender.com/api/tutor/health
```

---

**Need help? Check the guides above! 🎉**
