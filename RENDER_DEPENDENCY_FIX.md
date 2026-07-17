# Render Deployment Dependency Fix

## Problem Identified

The auth-service deployment was failing with:
```
Error: Cannot find module 'winston'
```

This error occurred because the project uses a monorepo structure with a shared package (`packages/shared`), but the build process wasn't installing the shared package's dependencies before building each service.

## Root Cause

The project structure:
- `packages/shared` - Contains shared utilities used by all services
- `services/*-service` - Each service depends on `@mgrand-hub/shared` via `file:../../packages/shared`

**The issue:** When Render builds each service, it runs:
```bash
cd services/auth-service && npm install
```

This installs the auth-service dependencies and creates a symlink to the shared package, BUT it doesn't install the shared package's own dependencies (winston, mongoose, ioredis, etc.).

## Solution Applied

Updated all service build commands in `render.yaml` to install shared package dependencies first:

### Before:
```yaml
buildCommand: cd services/auth-service && npm install
```

### After:
```yaml
buildCommand: cd packages/shared && npm install && cd ../../services/auth-service && npm install
```

This ensures:
1. First, install all dependencies for the shared package
2. Then, install the service's dependencies (which includes linking to the shared package)

## Services Updated

All seven services have been updated with the new build command:
- ✅ auth-service
- ✅ user-service
- ✅ ecommerce-service
- ✅ payment-service
- ✅ classifieds-service
- ✅ food-delivery-service
- ✅ notification-service

## Next Steps

1. **Commit and Push Changes:**
   ```bash
   git add render.yaml
   git commit -m "fix: Update Render build commands to install shared package dependencies"
   git push origin main
   ```

2. **Trigger Redeploy:**
   - Go to Render Dashboard: https://dashboard.render.com
   - Select "auth-service"
   - Click "Manual Deploy" → "Deploy latest commit"
   - OR wait for auto-deploy if enabled

3. **Monitor the Build:**
   Watch the build logs to confirm:
   - Shared package dependencies install successfully
   - Service builds without errors
   - Service starts and passes health check

## Expected Build Output

You should now see in the logs:
```
==> Building...
==> Running build command 'cd packages/shared && npm install && cd ../../services/auth-service && npm install'

packages/shared:
added 150 packages in 15s

services/auth-service:
added 200 packages in 20s

==> Build successful!
==> Running 'npm start'
Server running on port 3001
```

## Alternative Solution (For Future)

For a cleaner monorepo setup, consider using npm workspaces by updating the root `package.json`:

```json
{
  "name": "superapp-mgrand-hub",
  "workspaces": [
    "packages/*",
    "services/*"
  ]
}
```

Then update Render build commands to:
```yaml
buildCommand: npm install --workspaces && cd services/auth-service
```

This would install all workspace dependencies in a single command.

## Verification Checklist

After redeployment, verify:
- [ ] Build completes without "Cannot find module" errors
- [ ] Service starts successfully
- [ ] Health check endpoint responds: `curl https://auth-service.onrender.com/health`
- [ ] Test basic auth endpoints (register/login)

## Related Files

- `render.yaml` - Updated build commands for all services
- `packages/shared/package.json` - Contains dependencies like winston, mongoose, etc.
- `services/*/package.json` - Each service links to shared package

---

**Status:** ✅ Fix Applied - Ready for Redeploy
**Date:** 2026-07-17
**Impact:** All microservices
