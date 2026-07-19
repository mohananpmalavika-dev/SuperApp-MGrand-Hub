# ✅ Configure Frontend with Your Service URLs

## Your Service URLs

I've confirmed these are working:

- ✅ **Auth Service**: `https://auth-service-3lgk.onrender.com`
- ✅ **Tutor Service**: `https://tutor-service-wlhy.onrender.com` (VERIFIED - Health check passed!)

---

## 🎯 Quick Setup - Copy & Paste These Settings

### Step 1: Go to Your Frontend in Render

1. **Open Render Dashboard**: https://dashboard.render.com/
2. **Click on your frontend service** (React app)
3. **Click "Environment"** in the left sidebar

### Step 2: Add These Environment Variables

**Copy and paste each of these** (click "Add Environment Variable" for each):

```
Key: REACT_APP_AUTH_SERVICE_URL
Value: https://auth-service-3lgk.onrender.com
```

```
Key: REACT_APP_TUTOR_SERVICE_URL
Value: https://tutor-service-wlhy.onrender.com
```

```
Key: REACT_APP_API_URL
Value: https://auth-service-3lgk.onrender.com
```

### Step 3: Add Other Services (if deployed)

If you have these services deployed on Render, add their URLs too:

```
Key: REACT_APP_EDUCATION_SERVICE_URL
Value: https://YOUR-EDUCATION-SERVICE-NAME.onrender.com
```

```
Key: REACT_APP_USER_SERVICE_URL
Value: https://YOUR-USER-SERVICE-NAME.onrender.com
```

```
Key: REACT_APP_PAYMENT_SERVICE_URL
Value: https://YOUR-PAYMENT-SERVICE-NAME.onrender.com
```

```
Key: REACT_APP_ECOMMERCE_SERVICE_URL
Value: https://YOUR-ECOMMERCE-SERVICE-NAME.onrender.com
```

```
Key: REACT_APP_NOTIFICATION_SERVICE_URL
Value: https://YOUR-NOTIFICATION-SERVICE-NAME.onrender.com
```

### Step 4: Save and Deploy

1. **Scroll down and click "Save Changes"**
2. **Render will automatically trigger a redeploy** (takes ~2-5 minutes)
3. **Wait for the build to complete** - status will change to "Live"

---

## ✅ Verify It's Working

### 1. Test Tutor Service Health

Open this in your browser:
```
https://tutor-service-wlhy.onrender.com/api/tutor/health
```

Should show:
```json
{
  "success": true,
  "service": "tutor-service",
  "status": "healthy",
  "timestamp": "2026-07-19T09:21:17.334Z"
}
```

✅ **CONFIRMED WORKING!**

### 2. Test Your Frontend

After frontend redeploys:

1. **Open your frontend URL** in browser
2. **Open DevTools** (F12) → Network tab
3. **Navigate to Tutor Dashboard**
4. **Check the request URL** - should now be:
   ```
   ✅ https://tutor-service-wlhy.onrender.com/api/tutor/analytics/dashboard
   ```
   NOT:
   ```
   ❌ https://auth-service-3lgk.onrender.com/api/tutor/...
   ```

---

## 🎯 What This Fixes

### Before (Broken):
```
Frontend → auth-service → 404 (tutor endpoints don't exist here)
```

### After (Working):
```
Frontend → tutor-service → 200 ✅ (correct service)
Frontend → auth-service → 200 ✅ (for auth endpoints)
```

---

## 📋 Minimum Required Configuration

To get tutor features working, you ONLY need these 3:

```
REACT_APP_AUTH_SERVICE_URL=https://auth-service-3lgk.onrender.com
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-wlhy.onrender.com
REACT_APP_API_URL=https://auth-service-3lgk.onrender.com
```

Add other services as you deploy them.

---

## 🔍 How Frontend Routes Requests

Your frontend `src/config/api.config.js` has smart routing:

```javascript
// Tutor endpoints automatically use TUTOR_SERVICE_URL
TUTOR: {
  ANALYTICS: {
    DASHBOARD: `${TUTOR_SERVICE_URL}/api/tutor/analytics/dashboard`
    //                              ↑ Now points to tutor-service-wlhy.onrender.com
  }
}
```

Once you set `REACT_APP_TUTOR_SERVICE_URL`, all tutor endpoints automatically route correctly!

---

## 🚀 Next Steps

### 1. Configure CORS in Backend Services

Each service needs to allow your frontend domain:

**In your tutor-service** (Render environment):
```
Key: CORS_ORIGIN
Value: https://your-frontend-app.onrender.com
```

**In your auth-service** (Render environment):
```
Key: CORS_ORIGIN
Value: https://your-frontend-app.onrender.com
```

### 2. Deploy Other Services

Follow the same pattern:
1. Deploy service to Render
2. Copy the service URL
3. Add `REACT_APP_*_SERVICE_URL` to frontend
4. Redeploy frontend

### 3. Test All Features

After frontend redeploys, test:
- ✅ Login/Register (auth-service)
- ✅ Tutor Dashboard (tutor-service)
- ✅ AI Chat (tutor-service)
- ✅ Voice features (tutor-service)

---

## 🐛 Troubleshooting

### Frontend still showing 404 on tutor endpoints

**Check:**
1. ✅ Environment variables saved in Render
2. ✅ Frontend was redeployed AFTER saving
3. ✅ No typos in the URLs
4. ✅ Clear browser cache (Ctrl+Shift+R)

### CORS errors in browser console

**Fix:** Add `CORS_ORIGIN` to backend services:
```
# In tutor-service environment
CORS_ORIGIN=https://your-frontend.onrender.com

# Can also use wildcard for testing (not recommended for production)
CORS_ORIGIN=*
```

### Requests still going to wrong service

**Check frontend build logs:**
- Ensure environment variables are being set during build
- React apps bake env vars into build at compile time
- Must redeploy frontend after changing env vars

---

## 📝 Quick Reference Card

Save this for future service deployments:

| Service Type | Environment Variable | Current Value |
|--------------|---------------------|---------------|
| Auth | `REACT_APP_AUTH_SERVICE_URL` | `https://auth-service-3lgk.onrender.com` |
| Tutor | `REACT_APP_TUTOR_SERVICE_URL` | `https://tutor-service-wlhy.onrender.com` |
| Education | `REACT_APP_EDUCATION_SERVICE_URL` | Add when deployed |
| User | `REACT_APP_USER_SERVICE_URL` | Add when deployed |
| Payment | `REACT_APP_PAYMENT_SERVICE_URL` | Add when deployed |
| Ecommerce | `REACT_APP_ECOMMERCE_SERVICE_URL` | Add when deployed |
| Notification | `REACT_APP_NOTIFICATION_SERVICE_URL` | Add when deployed |

---

## 🎉 What You'll Get After This Fix

1. ✅ **Tutor Dashboard works** - No more 404 errors
2. ✅ **AI Chat works** - Connects to correct backend
3. ✅ **Voice features work** - Speech endpoints reachable
4. ✅ **Analytics work** - Dashboard loads data
5. ✅ **Login still works** - Auth endpoints unchanged

---

## 💡 Pro Tips

### Use Environment Files Locally

Create `frontend/.env.production`:
```env
REACT_APP_AUTH_SERVICE_URL=https://auth-service-3lgk.onrender.com
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-wlhy.onrender.com
REACT_APP_API_URL=https://auth-service-3lgk.onrender.com
```

### Test Locally Against Production Services

To test your local frontend against production backends:

1. Update `frontend/.env`:
   ```
   REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-wlhy.onrender.com
   ```

2. Restart local dev server:
   ```bash
   cd frontend
   npm start
   ```

Your local app will now call production APIs!

---

## ⚠️ Important Notes

1. **Environment variables are baked in at build time** for React apps
   - Changing them requires a redeploy
   - Not like backend where restart picks up changes

2. **CORS must be configured** on backend for cross-origin requests
   - Add frontend URL to CORS_ORIGIN on each service

3. **Services must be running** before frontend can call them
   - Check Render dashboard - services should show "Live" status

---

## 🎯 Bottom Line

**Add these 3 environment variables to your frontend service in Render:**

```
REACT_APP_AUTH_SERVICE_URL=https://auth-service-3lgk.onrender.com
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service-wlhy.onrender.com
REACT_APP_API_URL=https://auth-service-3lgk.onrender.com
```

**Save → Redeploy → Your tutor endpoints will work!** ✅

---

**Need your frontend URL?** Look in Render dashboard → Frontend service → URL at top of page.
