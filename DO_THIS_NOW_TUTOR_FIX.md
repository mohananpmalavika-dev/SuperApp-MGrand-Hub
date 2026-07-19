# ⚡ DO THIS NOW - Tutor Service Fix

## 🎯 Quick Action (5 minutes)

### Go to Render Dashboard → tutor-service → Settings

### Copy-Paste These 3 Settings:

#### 1. Root Directory
```
.
```
(Just a dot)

#### 2. Build Command
```bash
cd packages/shared && npm install && cd ../.. && cd services/tutor-service && npm install
```

#### 3. Start Command
```bash
cd services/tutor-service && npm start
```

### Then:
1. Click **Save Changes**
2. Click **Manual Deploy** → **Clear build cache & deploy**

---

## ✅ Done!

Your service will deploy successfully now.

**Why?** You're now deploying the entire repo (Root: `.`) so `packages/shared` is available to the service.

---

**See TUTOR_DEPLOYMENT_ROOT_DIRECTORY_FIX.md for complete explanation**
