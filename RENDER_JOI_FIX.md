# Render Deployment - Joi Dependency Fix

## Problem
User-service was failing on Render with error:
```
TypeError: Cannot read properties of undefined (reading 'object')
at Object.<anonymous> (/opt/render/project/src/services/user-service/src/routes/user.routes.js:16:13)
```

## Root Cause
The issue was caused by improper monorepo dependency resolution. When using `file:` protocol for the shared package (`@mgrand-hub/shared`), the shared package's own dependencies (like `joi`) weren't being properly resolved at runtime.

The previous build commands used `npm install --prefix` which installed dependencies but didn't properly link the shared package with its node_modules in a way that Node.js could resolve them at runtime.

## Solution
Updated all service build commands in `render.yaml` to follow this pattern:

```bash
cd packages/shared && npm install && cd ../../services/SERVICE_NAME && npm install && npm install ../../packages/shared
```

This approach:
1. **Installs shared package dependencies** in `packages/shared/node_modules`
2. **Installs service dependencies** in `services/SERVICE_NAME/node_modules`
3. **Re-installs the shared package** which properly links it with access to its own node_modules

## Services Updated
- ✅ auth-service
- ✅ user-service
- ✅ ecommerce-service
- ✅ payment-service
- ✅ classifieds-service
- ✅ food-delivery-service
- ✅ notification-service

## Next Steps
1. Commit the updated `render.yaml`
2. Push to trigger automatic redeployment on Render
3. Monitor the build logs to confirm successful dependency installation
4. Verify services start without Joi-related errors

## Verification Commands
Once deployed, check service health:
```bash
curl https://user-service.onrender.com/health
curl https://auth-service.onrender.com/health
```

## Alternative Solutions Considered
1. **Using peerDependencies**: Would require refactoring shared package - too invasive
2. **Copying node_modules**: Messy and error-prone
3. **NPM workspaces**: Would require restructuring the entire monorepo
4. **Adding joi to each service**: Would work but defeats the purpose of shared package

The chosen solution maintains the current architecture while ensuring proper dependency resolution.
