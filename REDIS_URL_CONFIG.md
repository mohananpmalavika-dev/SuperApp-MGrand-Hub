# 🔧 Redis URL Configuration Guide

**Use single REDIS_URL instead of separate host/port/password**

---

## ✅ Your Redis URL

```
redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
```

**Format:** `redis://[username]:[password]@[host]:[port]`

---

## 🎯 How to Use in Your Services

### Environment Variable

**Instead of:**
```
REDIS_HOST=sky-men-keystone-87098.db.redis.io
REDIS_PORT=12647
REDIS_PASSWORD=hmmZPWClCPxqvleq5HFYO9609wVKKTD9
```

**Use this single variable:**
```
REDIS_URL=redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
```

---

## 📝 Update Backend Services

### For Each Service (auth, user, payment, etc.)

#### Option 1: Update Environment Variables in Render

For each service in Render dashboard:

1. Go to service → **Environment** tab
2. **Remove** these variables (if they exist):
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`

3. **Add** this single variable:
   ```
   Key: REDIS_URL
   Value: redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
   ```

4. Click **Save Changes**
5. Service will auto-restart

#### Option 2: Update render.yaml (Blueprint)

Update your `render.yaml` file:

**Replace this:**
```yaml
envVars:
  - key: REDIS_HOST
    sync: false
  - key: REDIS_PORT
    value: 6379
  - key: REDIS_PASSWORD
    sync: false
```

**With this:**
```yaml
envVars:
  - key: REDIS_URL
    sync: false  # Set manually in dashboard with your actual URL
```

---

## 💻 Update Backend Code

### Check Your Redis Connection Code

Your services should connect using the URL. Here's how:

#### If using `ioredis`:

```javascript
const Redis = require('ioredis');

// Option 1: Direct URL (Recommended)
const redis = new Redis(process.env.REDIS_URL);

// Option 2: Parse URL if needed
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  family: 4, // Use IPv4
});

// Test connection
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});
```

#### If using `redis` package:

```javascript
const redis = require('redis');

// Create client with URL
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

await client.connect();
```

#### Legacy format (if your code uses separate host/port):

```javascript
// packages/shared/src/redis/index.js
const Redis = require('ioredis');

const createRedisClient = () => {
  // Support both REDIS_URL and legacy REDIS_HOST format
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  
  // Legacy fallback
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  });
};

module.exports = createRedisClient();
```

---

## 🔄 Complete Update Steps

### Step 1: Update Shared Package (if needed)

If you have `packages/shared/src/redis/index.js`, update it:

```javascript
const Redis = require('ioredis');

// Use REDIS_URL if available, fallback to individual vars
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    });

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

module.exports = redis;
```

### Step 2: Update All Services in Render

For **EACH** of these services:
- auth-service
- user-service
- ecommerce-service
- payment-service
- classifieds-service
- food-delivery-service
- notification-service

Do this:

1. Go to: https://dashboard.render.com
2. Click on the service
3. Click "Environment" tab
4. **Add** new variable:
   ```
   REDIS_URL = redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
   ```
5. **Delete** old variables (if they exist):
   - REDIS_HOST
   - REDIS_PORT
   - REDIS_PASSWORD
6. Click "Save Changes"

Services will restart automatically!

### Step 3: Test Connection

After updating, check service logs:

1. Go to service → **Logs** tab
2. Look for: `✅ Redis connected`
3. If you see errors, check the URL is correct

### Step 4: Test Functionality

Test features that use Redis:
- User login (sessions)
- Cache operations
- Rate limiting

---

## 📋 Environment Variables Checklist

### For ALL Services

```bash
# Required for all services
NODE_ENV=production
PORT=[service-specific: 3001, 3002, etc.]
MONGO_URI=mongodb+srv://admin:password@cluster.mongodb.net/mgrand-hub
REDIS_URL=redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
JWT_SECRET=[same for all services]
```

### Auth Service (3001)
```bash
JWT_EXPIRE=7d
```

### Payment Service (3004)
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NOTIFICATION_SERVICE_URL=https://notification-service.onrender.com
```

### Notification Service (3012)
```bash
SENDGRID_API_KEY=SG.xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🧪 Test Redis Connection

### Quick Test Script

Create `test-redis.js`:

```javascript
const Redis = require('ioredis');

const redis = new Redis('redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647');

redis.on('connect', () => {
  console.log('✅ Redis connected!');
  
  // Test set/get
  redis.set('test', 'hello');
  redis.get('test').then(value => {
    console.log('✅ Test value:', value);
    redis.disconnect();
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
  process.exit(1);
});
```

Run it:
```bash
node test-redis.js
```

---

## 🔧 Troubleshooting

### Error: "Redis connection refused"

**Check:**
1. URL is correct (no typos)
2. Redis database is running
3. No firewall blocking connection

**Test URL manually:**
```bash
redis-cli -u redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647 ping
```

Should return: `PONG`

### Error: "Authentication failed"

**Check:**
1. Password in URL is correct
2. Username is `default` (or correct username)
3. No URL encoding issues

### Error: "Could not connect to Redis"

**Check:**
1. Host is correct
2. Port is correct (12647)
3. Network allows outbound connections

---

## 📊 Benefits of REDIS_URL

✅ **Simpler** - One variable instead of three
✅ **More secure** - Password in single place
✅ **Standard format** - Works with most Redis clients
✅ **Easier to copy** - Just one string to manage
✅ **Cloud-friendly** - Most cloud providers give you a URL

---

## 🎯 Quick Copy-Paste

**For Render Dashboard (Environment Variables):**

```
Key: REDIS_URL
Value: redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
```

**For render.yaml:**

```yaml
- key: REDIS_URL
  sync: false  # Set in dashboard
```

**For .env file:**

```env
REDIS_URL=redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
```

---

## ✅ Verification Steps

After updating all services:

1. **Check Logs**
   - All services show: `✅ Redis connected`
   - No connection errors

2. **Test Login**
   - User can login
   - Session is created
   - Token works

3. **Test Cache**
   - Data is cached
   - Cache hits work
   - Cache expires properly

4. **Test Rate Limiting**
   - Rate limiting works
   - Limits reset correctly

---

## 🎉 Done!

Your Redis connection is now simplified!

**One URL to rule them all:** 
```
redis://default:hmmZPWClCPxqvleq5HFYO9609wVKKTD9@sky-men-keystone-87098.db.redis.io:12647
```

Use this in ALL your services! 🚀

---

*Need help? Check service logs in Render dashboard for connection status.*
