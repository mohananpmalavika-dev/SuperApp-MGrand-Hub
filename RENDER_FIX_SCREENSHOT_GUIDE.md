# 📸 Render Deployment - Visual Guide

## The Problem You're Having

You're seeing this error:
```
error Command "start" not found.
```

**Why?** Render is deploying from the ROOT directory, but your tutor service is in a subdirectory.

---

## ✅ The Solution (Visual Steps)

### STEP 1: Render Dashboard
```
┌─────────────────────────────────────────┐
│  Render Dashboard                       │
│  [New +] ← Click here                  │
│    │                                    │
│    └─→ Web Service                     │
└─────────────────────────────────────────┘
```

### STEP 2: Connect Repository
```
┌─────────────────────────────────────────┐
│  Connect a repository                   │
│                                         │
│  GitHub Repositories:                   │
│  ☐ SuperApp-MGrand-Hub ← Select this  │
│                                         │
│  [Connect]                              │
└─────────────────────────────────────────┘
```

### STEP 3: Service Settings

```
┌─────────────────────────────────────────┐
│  Create Web Service                     │
│                                         │
│  Name:                                  │
│  [tutor-service________________]        │
│                                         │
│  Region:                                │
│  [Oregon (US West)____________▼]        │
│                                         │
│  Branch:                                │
│  [main____________________▼]            │
│                                         │
│  Root Directory: ⚠️ CRITICAL!          │
│  [services/tutor-service_______]        │
│     ↑                                   │
│     └─ THIS IS THE KEY! Must set this! │
│                                         │
│  Runtime:                               │
│  [Node____________________▼]            │
│                                         │
│  Build Command:                         │
│  [npm install__________________]        │
│                                         │
│  Start Command:                         │
│  [npm start____________________]        │
│                                         │
│  [Advanced ▼] ← Click to add env vars  │
│                                         │
│  [Create Web Service]                   │
└─────────────────────────────────────────┘
```

### STEP 4: Environment Variables

```
┌─────────────────────────────────────────┐
│  Environment Variables                  │
│                                         │
│  Key                    Value           │
│  ────────────────────────────────────── │
│  NODE_ENV               production      │
│  PORT                   10000           │
│  MONGO_URI              mongodb+srv://  │
│  JWT_SECRET             [generate one]  │
│  ALLOWED_ORIGINS        https://...     │
│  ENABLE_AI_TUTOR        true            │
│  ENABLE_GAMIFICATION    true            │
│                                         │
│  [+ Add Environment Variable]           │
└─────────────────────────────────────────┘
```

---

## 📊 What Each Field Does

### Root Directory
```
services/tutor-service
```
**Why**: Tells Render to `cd` into this folder before building/starting.
**Without this**: Render tries to run from root → fails!

### Build Command
```
npm install
```
**Why**: Installs all dependencies from package.json
**Runs**: Inside `services/tutor-service/`

### Start Command
```
npm start
```
**Why**: Runs the script defined in package.json
**Equivalent to**: `node src/server.js`

---

## 🎯 Before vs After

### ❌ WRONG (What you were doing)

```
Repository Root
├── package.json ← Render was here (no start script!)
├── services/
│   └── tutor-service/
│       ├── package.json ← Should be here!
│       └── src/server.js
```

### ✅ CORRECT (What you should do)

```
Repository Root
├── package.json
├── services/
│   └── tutor-service/ ← Set as Root Directory!
│       ├── package.json ← Render now uses this!
│       └── src/server.js
```

---

## 🧪 Testing After Deploy

### 1. Check Service Status
In Render dashboard:
```
┌─────────────────────────────────────────┐
│  tutor-service                          │
│  ● Live ← Should show green dot        │
│                                         │
│  https://tutor-service-xxx.onrender.com│
│  ↑ Click to open                        │
└─────────────────────────────────────────┘
```

### 2. Test Health Endpoint
Open in browser:
```
https://tutor-service-xxx.onrender.com/api/tutor/health
```

Should see:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy"
}
```

### 3. Check Logs
Click **Logs** tab:
```
tutor-service is running on port 10000
Environment: production
MongoDB connected successfully
Health check: http://localhost:10000/api/tutor/health
```

---

## 🚀 Deploy All Services

Repeat for each service:

| Service | Root Directory | Port |
|---------|---------------|------|
| auth-service | `services/auth-service` | 3001 |
| user-service | `services/user-service` | 3002 |
| education-service | `services/education-service` | 3008 |
| tutor-service | `services/tutor-service` | 3013 |
| payment-service | `services/payment-service` | 3004 |
| notification-service | `services/notification-service` | 3012 |

**Important**: 
- All use same `MONGO_URI`
- All use same `JWT_SECRET`
- Each has unique `PORT`

---

## ✅ Success Indicators

You know it worked when:

1. **Build succeeds** - No errors in build logs
2. **Service is Live** - Green dot in dashboard
3. **Health check works** - Returns JSON response
4. **Logs show** - "MongoDB connected", "Server running on port..."
5. **Can make API calls** - No connection errors

---

## 💡 Common Mistakes to Avoid

### ❌ Forgetting Root Directory
```
Root Directory: [________]  ← WRONG! Will fail!
```

### ✅ Setting Root Directory
```
Root Directory: [services/tutor-service]  ← CORRECT!
```

### ❌ Wrong MongoDB IP Whitelist
```
MongoDB Atlas → Network Access → IP: 127.0.0.1  ← WRONG!
```

### ✅ Allow All IPs for Render
```
MongoDB Atlas → Network Access → IP: 0.0.0.0/0  ← CORRECT!
```

### ❌ Different JWT Secrets
```
auth-service:  JWT_SECRET=abc123
tutor-service: JWT_SECRET=xyz789  ← WRONG! Won't work!
```

### ✅ Same JWT Secret Everywhere
```
auth-service:  JWT_SECRET=abc123
tutor-service: JWT_SECRET=abc123  ← CORRECT!
```

---

**That's it! The key is the Root Directory setting. Good luck! 🎉**
