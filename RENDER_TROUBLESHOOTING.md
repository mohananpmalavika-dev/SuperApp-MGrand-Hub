# Render Deployment Troubleshooting Guide

## Issue: Cannot find module 'winston'

### Problem Analysis

The deployment fails with:
```
Error: Cannot find module 'winston'
Require stack:
- /opt/render/project/src/packages/shared/src/logger/index.js
```

**Root Cause:** The project uses a monorepo structure where services depend on a shared package via `file:` protocol. The shared package's dependencies weren't being installed properly during the Render build process.

### Solutions Attempted

#### Attempt 1: Chained cd commands ❌
```yaml
buildCommand: cd packages/shared && npm install && cd ../../services/auth-service && npm install
```
**Result:** Build showed only 21 packages installed (should be 150+)

#### Attempt 2: npm --prefix ❌  
```yaml
buildCommand: npm install --prefix packages/shared && npm install --prefix services/auth-service
```
**Result:** Same issue - runtime still couldn't find winston

#### Attempt 3: Build script ⏳ (Current)
```yaml
buildCommand: bash scripts/render-build.sh auth-service
```
**Status:** Testing now

---

## Recommended Solution: Flatten Dependencies

The most reliable solution for Render is to **flatten the dependency structure** by copying shared package dependencies into each service.

### Option A: Add shared dependencies to each service

Update each service's `package.json` to include the shared dependencies directly:

```json
{
  "dependencies": {
    "@mgrand-hub/shared": "file:../../packages/shared",
    "express": "^4.18.2",
    "winston": "^3.11.0",
    "mongoose": "^8.0.3",
    "ioredis": "^5.3.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0"
  }
}
```

This ensures all dependencies are available at runtime.

### Option B: Use npm workspaces

Update root `package.json`:
```json
{
  "name": "superapp-mgrand-hub",
  "private": true,
  "workspaces": [
    "packages/*",
    "services/*"
  ]
}
```

Then update render.yaml:
```yaml
buildCommand: npm install && cd services/auth-service
startCommand: cd services/auth-service && npm start
```

### Option C: Docker-based deployment (Most Reliable)

Instead of using Render's native Node.js environment, use Docker:

1. **Create `services/auth-service/Dockerfile.render`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared package
COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

# Copy service
COPY services/auth-service ./services/auth-service
WORKDIR /app/services/auth-service
RUN npm install

EXPOSE 3001
CMD ["npm", "start"]
```

2. **Update render.yaml:**
```yaml
- type: web
  name: auth-service
  env: docker
  region: oregon
  plan: standard
  dockerfilePath: ./services/auth-service/Dockerfile.render
  dockerContext: .
```

---

## Quick Fix: Manual Service Configuration

If you need to get this working immediately:

1. **Go to Render Dashboard**
2. **Delete the current auth-service**
3. **Create new Web Service manually:**
   - Name: `auth-service`
   - Root Directory: `services/auth-service`
   - Build Command: 
     ```bash
     cd ../../packages/shared && npm install && cd ../../services/auth-service && npm install
     ```
   - Start Command:
     ```bash
     npm start
     ```
   - Environment: Node
   - Add all environment variables

---

## Verification Steps

After deployment, verify:

1. **Check build logs** for dependency count:
   ```
   Should see: added 150+ packages (shared) + 200+ packages (service)
   Not: added 21 packages
   ```

2. **Check runtime path:**
   ```bash
   # In Render shell
   ls -la /opt/render/project/src/packages/shared/node_modules/winston
   ```

3. **Test the endpoint:**
   ```bash
   curl https://auth-service.onrender.com/health
   ```

---

## Next Steps

### If build script succeeds ✅
- Monitor the deployment
- Update all other services to use the same script

### If build script fails ❌
- Implement **Option A** (flatten dependencies) - fastest
- OR implement **Option C** (Docker) - most reliable

### Recommendation
For production reliability, I recommend **Option C (Docker)**. It gives you:
- ✅ Complete control over the build environment
- ✅ Consistent behavior between local and production
- ✅ Ability to test the exact deployment locally
- ✅ No surprises with how Render handles monorepos

---

## Implementation: Flatten Dependencies (Quick Win)

Let me help you implement Option A right now:

```bash
# For auth-service
cd services/auth-service
npm install winston mongoose ioredis bcryptjs jsonwebtoken joi axios --save
```

Repeat for all services. This adds ~50KB to each service's package.json but guarantees all dependencies are available.

---

**Current Status:** Testing build script approach  
**Recommended:** Switch to flattened dependencies or Docker  
**Date:** 2026-07-17
