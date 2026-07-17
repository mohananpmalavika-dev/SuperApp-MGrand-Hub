# Render Frontend - 404 & CORS Fix

## The Real Problem
The error shows `404 (Not Found)` for manifest.json, which means:
1. The file isn't being served at all
2. The CORS error is secondary - it appears because the redirect fails

## Root Causes
1. **Redirect Loop**: www.malabarbazaar.shop → malabarbazaar.shop redirect is breaking resource loading
2. **Missing File**: manifest.json might not be in the deployed build directory
3. **Wrong Configuration**: Render might not be using the correct settings

## Complete Fix

### Step 1: Configure Domain Properly in Render Dashboard

**MOST IMPORTANT**: Don't use file-based redirects for domain redirects on Render!

1. Go to Render Dashboard → Your Frontend Service
2. **Settings** → **Custom Domain**
3. **Remove** any automatic redirects if configured
4. **Add only ONE domain** as primary:
   - Either `malabarbazaar.shop` 
   - OR `www.malabarbazaar.shop`
5. **DO NOT add both** - this causes the redirect loop!

**Recommended Configuration:**
- **Primary Domain**: `malabarbazaar.shop` (non-www)
- **Don't add**: `www.malabarbazaar.shop` at all
- **Configure at DNS level** instead (see below)

### Step 2: DNS Configuration

Configure your DNS at your domain registrar to point www to non-www:

**For malabarbazaar.shop (apex/non-www):**
```
Type: A
Name: @
Value: 216.24.57.1 (Render's IP)
TTL: 3600
```

**For www.malabarbazaar.shop:**
```
Type: CNAME
Name: www
Value: malabarbazaar.shop
TTL: 3600
```

This makes www work automatically without needing Render redirects.

### Step 3: Verify Build Output

After the next deployment, check Render logs to confirm:
```
✓ manifest.json is in the build folder
✓ _headers file is in the build folder
✓ _redirects file is in the build folder
```

### Step 4: Update Your Site Reference

In your code/marketing materials, use only ONE canonical URL:
- ✅ `https://malabarbazaar.shop`
- ❌ `https://www.malabarbazaar.shop` (will auto-redirect via DNS)

## Files Modified

1. ✅ `frontend/public/index.html` - Fixed manifest reference
2. ✅ `frontend/public/manifest.json` - Fixed relative paths
3. ✅ `frontend/public/_redirects` - Updated to NOT redirect static files
4. ✅ `frontend/public/_headers` - Already has CORS headers
5. ✅ `frontend/package.json` - Added build verification
6. ✅ `frontend/render.yaml` - Already configured with CORS headers

## Alternative Solution: Keep Both Domains

If you MUST keep both domains in Render:

1. **Add both domains in Render**
2. **Set one as redirect source**:
   - Primary: `malabarbazaar.shop`
   - Redirect from: `www.malabarbazaar.shop`
3. **Use Render's built-in redirect** (not file-based)
4. **Update `_redirects`** to this minimal version:

```
# Only SPA fallback
/*    /index.html   200
```

This removes the domain redirect from the file since Render handles it.

## Testing

After deployment:

1. **Test non-www** directly:
   ```
   https://malabarbazaar.shop/manifest.json
   ```
   Should return the manifest JSON (not 404)

2. **Test in browser console**:
   ```javascript
   fetch('/manifest.json')
     .then(r => r.json())
     .then(d => console.log('✅ Manifest:', d))
     .catch(e => console.error('❌ Error:', e))
   ```

3. **Check response headers**:
   ```bash
   curl -I https://malabarbazaar.shop/manifest.json
   ```
   Should show:
   ```
   HTTP/2 200
   access-control-allow-origin: *
   content-type: application/manifest+json
   ```

## Quick Fix Checklist

- [ ] Remove www domain from Render (keep only non-www)
- [ ] Commit and push the code changes
- [ ] Wait for Render to redeploy
- [ ] Test manifest.json loads: https://malabarbazaar.shop/manifest.json
- [ ] Test in incognito browser - no CORS errors
- [ ] Configure DNS CNAME for www → non-www
- [ ] Clear browser cache and test again

## Why This Works

1. **Single Domain** eliminates the redirect loop
2. **DNS CNAME** handles www→non-www at network level (faster, no CORS issues)
3. **%PUBLIC_URL%** ensures React uses correct paths
4. **Relative paths in manifest** work from any URL
5. **No file-based domain redirects** avoids resource loading issues
6. **Explicit CORS headers** allow cross-origin if needed (but shouldn't be needed with single domain)

---

**Bottom Line**: Use ONE domain in Render, handle www redirect at DNS level!
