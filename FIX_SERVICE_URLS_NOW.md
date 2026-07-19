# 🚨 URGENT: Fix Service URL Routing

## The Problem

Your frontend is calling:
```
https://auth-service-3lgk.onrender.com/api/tutor/analytics/dashboard
                ↑ WRONG SERVICE
```

But tutor endpoints should go to:
```
https://your-tutor-service.onrender.com/api/tutor/analytics/dashboard
                ↑ CORRECT SERVICE
```

**Why?** Each microservice is deployed separately on Render, so tutor endpoints need to point to the tutor-service URL, not auth-service.

---

## 🎯 Quick Fix - Add Service URLs to Frontend

### Step 1: Get Your Render Service URLs

First, identify your deployed service URLs in Render dashboard:

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Find your services** - you should have:
   - ✅ `auth-service` → `https://auth-service-3lgk.onrender.com`
   - ✅ `tutor-service` → `https://YOUR-TUTOR-SERVICE-NAME.onrender.com`
   - ✅ `education-service` → `https://YOUR-EDUCATION-SERVICE-NAME.onrender.com`
   - ✅ Other services as deployed...

3. **Copy each service URL** - Click on service name, copy the URL at top

### Step 2: Configure Frontend Environment Variables

You need to add environment variables to your **frontend service** in Render:

1. **Go to your frontend service** in Render dashboard
2. **Click "Environment"** in left sidebar
3. **Add these environment variables**:

```
Key: REACT_APP_AUTH_SERVICE_URL
Value: https://auth-service-3lgk.onrender.com
```

```
Key: REACT_APP_TUTOR_SERVICE_URL
Value: https://your-tutor-service-name.onrender.com
```

```
Key: REACT_APP_EDUCATION_SERVICE_URL
Value: https://your-education-service-name.onrender.com
```

```
Key: REACT_APP_USER_SERVICE_URL
Value: https://your-user-service-name.onrender.com
```

```
Key: REACT_APP_PAYMENT_SERVICE_URL
Value: https://your-payment-service-name.onrender.com
```

```
Key: REACT_APP_ECOMMERCE_SERVICE_URL
Value: https://your-ecommerce-service-name.onrender.com
```

```
Key: REACT_APP_NOTIFICATION_SERVICE_URL
Value: https://your-notification-service-name.onrender.com
```

```
Key: REACT_APP_API_URL
Value: https://auth-service-3lgk.onrender.com
```

### Step 3: Save and Redeploy

1. **Click "Save Changes"**
2. **Render will rebuild and redeploy** your frontend
3. **Wait for build to complete** (~2-5 minutes)

---

## 📋 Service URL Mapping Reference

Your microservices architecture requires these endpoints:

| Service | Render URL Pattern | Example |
|---------|-------------------|---------|
| **Auth Service** | `https://auth-service-xxxx.onrender.com` | Login, Register, Profile |
| **Tutor Service** | `https://tutor-service-xxxx.onrender.com` | AI Tutoring, Sessions |
| **Education Service** | `https://education-service-xxxx.onrender.com` | Courses, Progress |
| **User Service** | `https://user-service-xxxx.onrender.com` | User profiles, Settings |
| **Payment Service** | `https://payment-service-xxxx.onrender.com` | Payments, Orders |
| **Ecommerce Service** | `https://ecommerce-service-xxxx.onrender.com` | Products, Cart |
| **Notification Service** | `https://notification-service-xxxx.onrender.com` | Notifications |

---

## 🔍 How Frontend Routes Requests

Your frontend has smart routing in `src/config/api.config.js`:

```javascript
TUTOR: {
  ANALYTICS: {
    DASHBOARD: `${config.TUTOR_SERVICE_URL}/api/tutor/analytics/dashboard`
  }
}
```

This means:
- ✅ `TUTOR_SERVICE_URL` → Correct tutor-service URL
- ❌ Without env var → Falls back to `localhost:3013`
- ❌ Using `API_URL` → Goes to auth-service (WRONG!)

---

## 🛠️ Verify Current Configuration

### Check What's Currently Set:

1. **In Render dashboard** → Your frontend service → Environment tab
2. **Look for** `REACT_APP_*` variables
3. **Verify each service URL** is correct

### Common Issues:

❌ **No `REACT_APP_TUTOR_SERVICE_URL` set**
→ Frontend uses `localhost:3013` (won't work in production)

❌ **All requests go to `auth-service`**
→ Missing individual service URL variables

❌ **404 errors on specific endpoints**
→ Service URL pointing to wrong service

---

## 🧪 Test After Fix

### 1. Check Build Logs

After redeploying, check your frontend build logs:

```
Setting environment variables...
REACT_APP_AUTH_SERVICE_URL=https://auth-service...
REACT_APP_TUTOR_SERVICE_URL=https://tutor-service...
✓ Build successful
```

### 2. Test in Browser Console

Open your deployed frontend, open DevTools Console, run:

```javascript
console.log('Auth Service:', process.env.REACT_APP_AUTH_SERVICE_URL);
console.log('Tutor Service:', process.env.REACT_APP_TUTOR_SERVICE_URL);
```

**Note:** In production builds, these won't show (they're compiled in). Instead, check Network tab.

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Try accessing tutor dashboard
3. **Verify request URL**:
   - ✅ Should go to: `https://tutor-service-xxx.onrender.com/api/tutor/analytics/dashboard`
   - ❌ NOT: `https://auth-service-xxx.onrender.com/api/tutor/...`

---

## 🚨 Critical: Services Must Be Running

**Before testing frontend**, ensure these services are deployed and running:

```bash
# Check in Render dashboard - all should show "Live" status:
✅ auth-service - Live
✅ tutor-service - Live (with MONGODB_URI set!)
✅ education-service - Live (with GROQ_API_KEY set!)
```

If any service is "Failed" or "Deploying":
1. Fix that service first (see FIX_MONGODB_NOW.md, FIX_EDUCATION_SERVICE_NOW.md)
2. Wait for it to go "Live"
3. Then redeploy frontend

---

## 📝 Quick Copy-Paste Template

Replace `YOUR-SERVICE-NAME` with actual service names from Render:

```
REACT_APP_AUTH_SERVICE_URL=https://auth-service-3lgk.onrender.com
REACT_APP_TUTOR_SERVICE_URL=https://YOUR-TUTOR-SERVICE-NAME.onrender.com
REACT_APP_EDUCATION_SERVICE_URL=https://YOUR-EDUCATION-SERVICE-NAME.onrender.com
REACT_APP_USER_SERVICE_URL=https://YOUR-USER-SERVICE-NAME.onrender.com
REACT_APP_PAYMENT_SERVICE_URL=https://YOUR-PAYMENT-SERVICE-NAME.onrender.com
REACT_APP_ECOMMERCE_SERVICE_URL=https://YOUR-ECOMMERCE-SERVICE-NAME.onrender.com
REACT_APP_NOTIFICATION_SERVICE_URL=https://YOUR-NOTIFICATION-SERVICE-NAME.onrender.com
REACT_APP_API_URL=https://auth-service-3lgk.onrender.com
```

---

## 🔄 Alternative: Use API Gateway

If managing multiple service URLs is complex, consider deploying your API Gateway:

### Deploy Gateway Service:
```yaml
# In render.yaml or manual setup
- type: web
  name: api-gateway
  env: node
  buildCommand: cd gateway && npm install
  startCommand: cd gateway && npm start
  envVars:
    - key: NODE_ENV
      value: production
```

Then frontend only needs:
```
REACT_APP_API_URL=https://your-gateway.onrender.com
```

Gateway routes to correct services internally.

---

## 🐛 Troubleshooting

### Issue: Still getting 404 on tutor endpoints

**Check:**
1. ✅ `REACT_APP_TUTOR_SERVICE_URL` is set in frontend environment
2. ✅ Tutor service is "Live" in Render
3. ✅ Frontend was redeployed AFTER adding env vars
4. ✅ Browser cache cleared (hard refresh: Ctrl+Shift+R)

### Issue: All requests go to auth-service

**Fix:**
- Must set individual `REACT_APP_*_SERVICE_URL` variables
- Setting only `REACT_APP_API_URL` is not enough
- Frontend config file has fallbacks but they use localhost

### Issue: CORS errors after fixing URLs

**Fix:**
Each backend service needs CORS configuration:

```javascript
// In each service's app.js or server.js
app.use(cors({
  origin: [
    'https://your-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Add `CORS_ORIGIN` env var to each backend service:
```
CORS_ORIGIN=https://your-frontend.onrender.com
```

---

## ✅ Success Checklist

After applying the fix:

- [ ] All `REACT_APP_*_SERVICE_URL` variables added to frontend
- [ ] Frontend redeployed successfully
- [ ] All backend services showing "Live" status
- [ ] Tutor dashboard loads without 404
- [ ] Network tab shows correct service URLs
- [ ] No CORS errors in console
- [ ] API responses are successful (200 status)

---

## 📚 Related Guides

- **Backend Setup**: See `FIX_MONGODB_NOW.md` for tutor-service
- **Education Service**: See `FIX_EDUCATION_SERVICE_NOW.md`
- **CORS Issues**: See `CORS_OPEN_NOW.md`

---

## 🎯 Quick Command to Find Service URLs

If you have Render CLI installed:

```bash
# List all services
render services list

# Get specific service URL
render service get tutor-service
```

Or manually from dashboard: Dashboard → Service → Copy URL at top.

---

**Bottom Line**: Add `REACT_APP_TUTOR_SERVICE_URL` (and other service URLs) to your frontend's environment variables in Render, then redeploy. Each microservice needs its own URL configured!
