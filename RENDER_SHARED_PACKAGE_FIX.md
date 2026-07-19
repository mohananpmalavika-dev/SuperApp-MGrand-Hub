# 🔧 Fix: Shared Package Not Found Error

## The Error You're Seeing
```
Error: Cannot find module '../../../packages/shared/src/middleware/auth'
```

## Why This Happens
When you set **Root Directory** to `services/tutor-service`, Render can't access `packages/shared` because it's outside that directory.

---

## ✅ Solution 1: Change Build Command (Easiest)

### In Render Dashboard

**Current (Wrong):**
```
Build Command: npm install
```

**Change to (Correct):**
```
Build Command: cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install
```

This command:
1. Goes back to root (`cd ../..`)
2. Installs shared package (`cd packages/shared && npm install`)
3. Goes to tutor service (`cd ../../services/tutor-service`)
4. Installs tutor service dependencies (`npm install`)

### Keep Everything Else the Same
```
Root Directory:  services/tutor-service
Start Command:   npm start
```

---

## ✅ Solution 2: Remove Root Directory (Alternative)

If Solution 1 doesn't work, try this:

### Change These Settings:

| Field | Old Value | New Value |
|-------|-----------|-----------|
| Root Directory | `services/tutor-service` | **(Leave empty)** |
| Build Command | `npm install` | `cd packages/shared && npm install && cd ../services/tutor-service && npm install` |
| Start Command | `npm start` | `cd services/tutor-service && npm start` |

---

## ✅ Solution 3: Copy Shared Package (Quick Fix)

If you need a quick deploy now, copy the shared package into tutor-service:

### Step 1: Update Build Command
```bash
npm install && cp -r ../../packages/shared ./packages/
```

### Step 2: Update Imports in Code

Change from:
```javascript
const auth = require('../../../packages/shared/src/middleware/auth');
```

To:
```javascript
const auth = require('./packages/shared/src/middleware/auth');
```

⚠️ **Not recommended** - This is a temporary workaround.

---

## 🎯 RECOMMENDED: Use Solution 1

### Complete Settings for Render:

```yaml
Name:               tutor-service
Region:             Oregon (US West)
Branch:             main
Root Directory:     services/tutor-service

Build Command:
cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install

Start Command:      npm start
Health Check Path:  /api/tutor/health
```

---

## 📋 Copy-Paste Values

### Build Command (Copy This Exactly):
```
cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install
```

### Or for Windows-style paths:
```
cd ..\.. && cd packages\shared && npm install && cd ..\..\services\tutor-service && npm install
```

### Or using a single line (Linux/Mac):
```
(cd ../../packages/shared && npm install) && npm install
```

---

## 🧪 Test Locally First

Before deploying, test that the build works:

```powershell
# Navigate to tutor service
cd services\tutor-service

# Go back and build shared
cd ..\..
cd packages\shared
npm install

# Go to tutor service and build
cd ..\..\services\tutor-service
npm install

# Start the service
npm start
```

If this works locally, it should work on Render!

---

## 🐛 If Still Not Working

### Check the Build Logs

Look for these in Render logs:
```
==> Running build command...
==> Installing dependencies in packages/shared
==> Installing dependencies in services/tutor-service
==> Build successful
```

### Common Issues:

**Issue 1: Path not found**
```
Error: no such file or directory
```
**Fix**: Make sure you're using the right path separators (`/` not `\`)

**Issue 2: Permission denied**
```
Error: EACCES: permission denied
```
**Fix**: Render should have permissions. Try without `cd ../..`

**Issue 3: Module still not found**
```
Error: Cannot find module
```
**Fix**: The shared package might not be linked correctly. Try Solution 2.

---

## 💡 Understanding the Directory Structure

```
Repository Root
├── packages/
│   └── shared/           ← Shared code used by all services
│       ├── package.json
│       └── src/
│           ├── middleware/
│           │   └── auth.js
│           ├── utils/
│           └── database/
│
└── services/
    └── tutor-service/    ← Root Directory in Render
        ├── package.json
        └── src/
            ├── routes/
            │   └── index.js  ← Tries to import ../../../packages/shared
            └── server.js
```

When Root Directory = `services/tutor-service`:
- Render starts here: `/opt/render/project/src/services/tutor-service`
- Code tries to access: `../../../packages/shared`
- Real path needed: `/opt/render/project/src/packages/shared`
- **Problem**: Need to go up to root first!

---

## ✅ Final Settings (Copy These Exactly)

```
Service Name:       tutor-service
Root Directory:     services/tutor-service

Build Command:
cd ../.. && cd packages/shared && npm install && cd ../../services/tutor-service && npm install

Start Command:      npm start

Environment Variables:
NODE_ENV=production
PORT=10000
MONGO_URI=[your-mongodb-uri]
JWT_SECRET=[your-jwt-secret]
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
ENABLE_AI_TUTOR=true
ENABLE_GAMIFICATION=true
```

---

## 🚀 Deploy Now!

1. Go to your service in Render Dashboard
2. Click **Settings**
3. Scroll to **Build & Deploy**
4. Update **Build Command** with the new command above
5. Click **Save Changes**
6. Click **Manual Deploy** → **Clear build cache & deploy**

---

**This should fix the module not found error! 🎉**
