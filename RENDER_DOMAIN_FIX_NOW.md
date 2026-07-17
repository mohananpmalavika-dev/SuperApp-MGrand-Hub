# URGENT: Fix Domain Redirect Issue on Render

## The Real Problem

You're getting CORS errors because **BOTH www and non-www are active**, causing:
1. Browser loads `www.malabarbazaar.shop`
2. Server redirects to `malabarbazaar.shop`
3. Browser blocks cross-origin manifest load (www ≠ non-www)

## Solution: Configure Render to Use ONE Domain Only

### Option 1: Use Non-WWW Only (Recommended - Simpler)

#### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Select your frontend service (mgrand-hub-frontend)
3. Go to **Settings** → **Custom Domain**

#### Step 2: Configure Domain
**Remove or Disable www:**
- **Keep**: `malabarbazaar.shop` (primary)
- **Remove**: `www.malabarbazaar.shop` (or set to redirect)

#### Step 3: Set Redirect in Render
- In Custom Domain settings, look for "Redirect www to non-www" option
- Enable this option if available
- This makes Render handle the redirect at the server level BEFORE serving content

### Option 2: Use WWW Only

If you prefer www:
- **Keep**: `www.malabarbazaar.shop` (primary)
- **Remove**: `malabarbazaar.shop` (or set to redirect)
- Update DNS to point non-www to www

### Option 3: Manual DNS Redirect (If Render doesn't have redirect option)

Configure your DNS provider to redirect:

**For non-www primary:**
```
Type: A
Name: @
Value: 216.24.57.1

Type: CNAME
Name: www
Value: malabarbazaar.shop (with redirect/forward)
```

**Or use a redirect service:**
```
Type: A
Name: @  
Value: 216.24.57.1

Type: URL Redirect (or similar)
Name: www
Target: https://malabarbazaar.shop
Type: 301 Permanent
```

## What I've Already Done

✅ Updated `_headers` to allow all CORS (*)
✅ Updated `index.html` manifest reference
✅ Updated `render.yaml` with wildcard CORS
✅ Updated `_redirects` for proper routing

## Critical Configuration Checklist

### In Render Dashboard:

- [ ] Go to your service settings
- [ ] Custom Domain section
- [ ] **ONLY ONE domain should be "Primary"**
- [ ] The other should redirect to the primary
- [ ] Save settings
- [ ] Manually trigger redeploy

### In Your DNS Provider:

Make sure you have:
```
# For non-www primary (recommended):
@ (apex)    A       216.24.57.1
www         CNAME   malabarbazaar.shop

# OR for www primary:
@           A       216.24.57.1 (then redirect to www)
www         CNAME   your-service.onrender.com
```

## Test After Configuration

1. **Clear ALL browser data** (Ctrl+Shift+Delete)
2. **Open incognito mode**
3. **Type directly**: `malabarbazaar.shop` (without www)
4. **Check console**: Should have NO CORS errors
5. **Try www version**: Should redirect immediately to non-www

## Verification Commands

```bash
# Test non-www
curl -I https://malabarbazaar.shop/manifest.json

# Should show:
# HTTP/2 200
# access-control-allow-origin: *
# content-type: application/manifest+json

# Test www (should redirect)
curl -I https://www.malabarbazaar.shop

# Should show:
# HTTP/2 301 (or 302)
# location: https://malabarbazaar.shop
```

## Why This Happens

The browser sees `www.malabarbazaar.shop` and `malabarbazaar.shop` as **completely different domains** (like google.com vs facebook.com). When a page from one domain tries to load resources from another, it's blocked by CORS policy.

The solution is NOT to allow CORS between them, but to **use only ONE domain** and redirect the other at the server level BEFORE any content is served.

## Immediate Action Required

1. **Go to Render Dashboard NOW**
2. **Settings → Custom Domain**
3. **Choose ONE primary domain**
4. **Remove or redirect the other**
5. **Redeploy your service**
6. **Wait 2-3 minutes**
7. **Test in incognito mode**

---

**After you configure this in Render, the CORS errors will disappear!**
