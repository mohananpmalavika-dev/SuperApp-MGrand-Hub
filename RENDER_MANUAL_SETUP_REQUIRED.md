# Render Manual Setup Required

## Critical Discovery

**Render is ignoring the `render.yaml` build commands** and auto-detecting the service based on finding `package.json` in `services/auth-service/`.

Evidence from logs:
```
==> Using Node.js version 26.5.0 via /opt/render/project/src/services/auth-service/package.json
==> Running build command 'npm install'...
```

It should have run: `npm run build:auth-service` but instead ran just `npm install`.

## Why This Happens

Render's auto-detection overrides Blueprint (`render.yaml`) settings when:
1. It finds a `package.json` in a subdirectory
2. The service is already created and has cached settings
3. The Blueprint isn't being applied correctly

## Solution: Manual Service Configuration

You need to **manually configure the service in Render Dashboard**:

### Step 1: Delete Current Service

1. Go to https://dashboard.render.com
2. Find "auth-service"
3. Settings → Delete Service

### Step 2: Create New Web Service Manually

1. Click "New +" → "Web Service"
2. Connect to your GitHub repository: `SuperApp-MGrand-Hub`
3. Configure as follows:

**Basic Settings:**
- **Name:** `auth-service`
- **Region:** Oregon (US West)
- **Branch:** `main`
- **Root Directory:** Leave EMPTY (or set to repository root `.`)
- **Environment:** Node
- **Build Command:** 
  ```bash
  cd packages/shared && npm install && cd ../../services/auth-service && npm install
  ```
- **Start Command:**
  ```bash
  cd services/auth-service && npm start
  ```

**Advanced Settings:**
- **Auto-Deploy:** Yes
- **Health Check Path:** `/health`

### Step 3: Environment Variables

Add these environment variables:

```
NODE_ENV=production
PORT=3001
MONGO_URI=<your-mongodb-connection-string>
REDIS_URL=<your-redis-connection-string>
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRE=7d
```

### Step 4: Deploy and Monitor

Watch the build logs carefully for:
```
cd packages/shared && npm install
added 150+ packages ← CRITICAL: Must see this

cd ../../services/auth-service && npm install  
added 200+ packages

Server running on port 3001
```

## Alternative: Use Shell Script

If manual commands still don't work, use our build script:

**Build Command:**
```bash
bash scripts/render-build.sh auth-service
```

Make sure `scripts/render-build.sh` has execute permissions (already committed).

## Alternative: Docker Deployment (RECOMMENDED)

The most reliable solution is to switch to Docker:

### Create Dockerfile

Create `services/auth-service/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy and install shared package first
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN npm install

# Copy and install service
COPY services/auth-service ./services/auth-service
WORKDIR /app/services/auth-service  
RUN npm install

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \  
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start service
CMD ["npm", "start"]
```

### Create Service in Render (Docker)

1. New Web Service
2. Repository: SuperApp-MGrand-Hub
3. Environment: **Docker**
4. Dockerfile Path: `./services/auth-service/Dockerfile`
5. Docker Build Context Directory: `.` (root)

### Why Docker is Better

- ✅ **No auto-detection** interference
- ✅ **Complete control** over build process
- ✅ **Testable locally**: `docker build -t auth-service .`
- ✅ **Production-ready**: Used by enterprises
- ✅ **Portable**: Works on any platform
- ✅ **Predictable**: Exact same environment every time

## Immediate Action Required

### Option A: Manual Dashboard Configuration (Quick)
1. Delete current service
2. Create new service with manual build commands
3. Deploy and verify

### Option B: Docker Deployment (Reliable)
1. Create Dockerfile as shown above
2. Commit and push
3. Create new Docker-based service in Render
4. Deploy

## Testing After Deployment

Once deployed successfully:

```bash
# Test health endpoint
curl https://auth-service-xxxx.onrender.com/health

# Test register
curl -X POST https://auth-service-xxxx.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Test login
curl -X POST https://auth-service-xxxx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

## Summary

**Current Problem:** Render auto-detection ignores build commands  
**Root Cause:** Blueprint not being applied correctly  
**Immediate Fix:** Manual service configuration in dashboard  
**Long-term Fix:** Switch to Docker deployment  

**Recommended Path:**
1. Try manual dashboard configuration first (fastest)
2. If that fails, switch to Docker (most reliable)

---

**Status:** Requires manual intervention in Render dashboard  
**Next Step:** Delete and recreate service with correct build command  
**Date:** 2026-07-17
