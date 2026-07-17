# Render Frontend - CORS & Domain Redirect Fix

## Problem
Frontend deployed on Render at `malabarbazaar.shop` is showing CORS errors:
```
Access to manifest at 'https://malabarbazaar.shop/manifest.json' 
(redirected from 'https://www.malabarbazaar.shop/manifest.json') 
from origin 'https://www.malabarbazaar.shop' has been blocked by CORS policy
```

## Root Cause
1. **Domain Redirect Loop**: Site is redirecting between `www.malabarbazaar.shop` and `malabarbazaar.shop`
2. **Missing CORS Headers**: Static files like manifest.json don't have proper CORS headers
3. **Cross-Origin Resource Loading**: Browser blocks resources from different origins (www vs non-www)

## Solution Applied

### 1. Created `_headers` File
Location: `frontend/public/_headers`

This file sets proper CORS headers for all static assets, including:
- Allow all origins for public assets
- Proper caching strategies
- Security headers

### 2. Created `_redirects` File
Location: `frontend/public/_redirects`

Handles:
- Permanent redirect from www to non-www (or vice versa)
- SPA routing fallback to index.html

**Choose Your Preferred Domain:**
- **Option 1**: Redirect www → non-www (default in file)
- **Option 2**: Redirect non-www → www (comment/uncomment in file)

### 3. Created `render.yaml` for Frontend
Location: `frontend/render.yaml`

Configures Render deployment with:
- CORS headers at the service level
- Proper routing for SPA
- Build and publish settings

## Render Dashboard Configuration

### Step 1: Configure Custom Domain
1. Go to your Render dashboard
2. Select your frontend service
3. Navigate to **Settings** → **Custom Domain**
4. Add both domains:
   - `malabarbazaar.shop`
   - `www.malabarbazaar.shop`
5. Choose which one should be **primary**

### Step 2: Set Primary Domain
Pick ONE as primary (recommended: non-www for simplicity):
- **Primary**: `malabarbazaar.shop`
- **Redirect from**: `www.malabarbazaar.shop`

### Step 3: Verify DNS Settings
Ensure your DNS has:

**For non-www (apex domain):**
```
Type: A
Name: @
Value: 216.24.57.1 (Render's IP)
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: malabarbazaar.shop (or your-service.onrender.com)
```

### Step 4: Enable Auto-Deploy
Make sure **Auto-Deploy** is enabled so changes trigger redeployment.

## Testing the Fix

After deployment, test:

1. **Check Redirect**:
   ```bash
   curl -I https://www.malabarbazaar.shop
   # Should show 301 redirect to https://malabarbazaar.shop
   ```

2. **Check CORS Headers**:
   ```bash
   curl -I https://malabarbazaar.shop/manifest.json
   # Should show Access-Control-Allow-Origin: *
   ```

3. **Check in Browser**:
   - Open https://www.malabarbazaar.shop
   - Should redirect to https://malabarbazaar.shop
   - Open DevTools Console - no CORS errors
   - Check Network tab - manifest.json loads successfully

## Files Modified/Created

- ✅ `frontend/public/_headers` (new)
- ✅ `frontend/public/_redirects` (new)
- ✅ `frontend/render.yaml` (new)

## Deployment Steps

1. **Commit and push changes**:
   ```bash
   git add frontend/public/_headers frontend/public/_redirects frontend/render.yaml
   git commit -m "fix: Add CORS headers and domain redirect configuration"
   git push origin main
   ```

2. **Render will auto-deploy** (if auto-deploy is enabled)

3. **Or manually deploy**:
   - Go to Render dashboard
   - Select your frontend service
   - Click "Manual Deploy" → "Deploy latest commit"

4. **Clear browser cache** after deployment:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or open in Incognito mode to test

## Alternative: Netlify-style Headers (if above doesn't work)

If Render doesn't pick up `_headers`, you can add headers via package.json build script:

```json
{
  "scripts": {
    "build": "react-scripts build && echo '/*    /index.html   200' > build/_redirects && cp public/_headers build/_headers"
  }
}
```

## Troubleshooting

### CORS errors still appear:
1. Clear browser cache completely
2. Check browser DevTools → Network → Response Headers
3. Verify `_headers` file is in the `build` folder after build
4. Check Render logs for any deployment errors

### Redirect not working:
1. Verify DNS settings in your domain registrar
2. Wait for DNS propagation (can take up to 48 hours)
3. Check Render's custom domain status (should show green checkmark)
4. Use `dig` or `nslookup` to verify DNS:
   ```bash
   nslookup malabarbazaar.shop
   nslookup www.malabarbazaar.shop
   ```

### Manifest still fails to load:
1. Verify file exists: https://malabarbazaar.shop/manifest.json
2. Check Content-Type header is `application/json`
3. Ensure manifest.json is in `public` folder (gets copied to build)

## Next Steps

1. ⏳ Commit and push the configuration files
2. ⏳ Wait for Render to redeploy
3. ⏳ Configure custom domain settings in Render dashboard
4. ⏳ Test in browser (incognito mode recommended)
5. ⏳ Clear cache and verify no CORS errors

## Notes

- The `_headers` and `_redirects` files are Netlify-style configurations
- Render supports these formats for static sites
- Files must be in the `public` folder so they're copied to `build` during the build process
- Choose ONE redirect direction (www→non-www OR non-www→www), not both
