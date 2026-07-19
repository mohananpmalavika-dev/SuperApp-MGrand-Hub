# ⚡ QUICK FIX - Module Not Found Error

## Your Error
```
Error: Cannot find module '../../../packages/shared/src/middleware/auth'
```

## The Fix (3 Critical Settings)

### ⚠️ IMPORTANT: Change Root Directory First!

The problem is that Render is only deploying the `services/tutor-service` folder, but your code needs access to `packages/shared` which is outside that folder.

---

## 🎯 Exact Settings for Copy-Paste

**Go to your tutor-service in Render Dashboard → Settings**

### 1. Root Directory
Change from `services/tutor-service` to:
```
.
```
(Just a single dot - this deploys the entire repository)

### 2. Build Command
```bash
cd packages/shared && npm install && cd ../.. && cd services/tutor-service && npm install
```

### 3. Start Command
```bash
cd services/tutor-service && npm start
```

### 4. Health Check Path (no change)
```
/api/tutor/health
```

---

## 📝 Step-by-Step Instructions

1. **Open Render Dashboard** → Find your `tutor-service`

2. **Go to Settings Tab** → Scroll to "Build & Deploy"

3. **Update Root Directory:**
   - Find "Root Directory" field
   - Delete `services/tutor-service`
   - Type just: `.` (a single dot)
   - This tells Render to use the entire repository

4. **Update Build Command:**
   - Find "Build Command" field
   - Paste:
   ```bash
   cd packages/shared && npm install && cd ../.. && cd services/tutor-service && npm install
   ```

5. **Update Start Command:**
   - Find "Start Command" field
   - Paste:
   ```bash
   cd services/tutor-service && npm start
   ```

6. **Save Changes** (button at bottom)

7. **Manual Deploy:**
   - Click "Manual Deploy" button (top right)
   - Select "Clear build cache & deploy"

---

## ✅ What This Does

### Root Directory: `.`
- Deploys your **entire repository** (not just the service folder)
- Makes `packages/shared` available to all services

### Build Command:
1. **`cd packages/shared`** - Goes to shared package
2. **`npm install`** - Installs shared dependencies
3. **`cd ../..`** - Returns to root
4. **`cd services/tutor-service`** - Goes to tutor service
5. **`npm install`** - Installs tutor service dependencies (can now find shared!)

### Start Command:
- **`cd services/tutor-service`** - Navigates to service
- **`npm start`** - Runs the service from correct location

---

## 🎨 Visual Navigation

```
Render Dashboard
  → tutor-service
    → Settings Tab
      → Build & Deploy Section
        1. Root Directory: .
        2. Build Command: [paste command above]
        3. Start Command: cd services/tutor-service && npm start
        → [Save Changes] (bottom of page)
    → Manual Deploy (top right)
      → Clear build cache & deploy
```

---

## 🐛 Troubleshooting

### If you see "npm ERR! enoent ENOENT"
Your paths might be wrong. Double-check:
- Root Directory is just `.` (not empty, not a path)
- Build command has correct path separators

### If build times out
The build command is installing too slowly. Try this faster version:
```bash
npm install --prefix packages/shared && npm install --prefix services/tutor-service
```

### If "Cannot find module" persists
After changing Root Directory, you **must** clear the build cache:
- Manual Deploy → "Clear build cache & deploy"

---

## � Why This Works

**Before:** 
- Render only deployed `services/tutor-service` folder
- Your code tried to access `../../../packages/shared` 
- But `packages` folder wasn't deployed ❌

**After:**
- Render deploys entire repository (Root Directory: `.`)
- Both `packages/shared` and `services/tutor-service` are available ✅
- Relative imports work correctly!

---

## � Alternative Solution: Use npm Workspaces

If you want a cleaner solution for the future, consider setting up npm workspaces. See **RENDER_SHARED_PACKAGE_FIX.md** for details.

---

**Apply these settings now and redeploy! Your service will work! 🎉**
