# ⚠️ MongoDB Connection Timeout Issue

## Problem

The setup script is timing out when trying to connect to MongoDB Atlas:
```
Error: querySrv ETIMEOUT _mongodb._tcp.cluster0.5kqyosa.mongodb.net
```

## Possible Causes

1. **Firewall/Network Issue** - Your network may be blocking MongoDB Atlas connection
2. **VPN/Proxy** - If you're behind a corporate VPN or proxy
3. **MongoDB Atlas IP Whitelist** - Need to add your IP
4. **Internet Connection** - Slow or unstable connection

---

## 🔧 Solutions (Try in Order)

### Solution 1: Check MongoDB Atlas IP Whitelist

1. Go to: https://cloud.mongodb.com
2. Click **Network Access** (left sidebar)
3. Check if you have: **0.0.0.0/0** (Allow access from anywhere)
4. If not, click **Add IP Address** → **Allow Access from Anywhere**
5. Try running setup again

### Solution 2: Try Different Network

If you're on a restricted network:
- Try from home WiFi instead of office
- Disable VPN temporarily
- Use mobile hotspot

### Solution 3: Use Local MongoDB (Alternative)

Install MongoDB locally:

```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Compass with local instance

# Update .env in scripts folder:
MONGODB_URI=mongodb://localhost:27017/mgrandhub

# Run setup again
cd scripts
node setup-ca-tutorials-in-education-module.js
```

### Solution 4: Manual Import (Temporary Workaround)

I can create a script that works without MongoDB connection, generating API-ready files:

```bash
cd scripts
node create-api-ready-courses.js
```

This will create files you can manually import later when MongoDB connection works.

---

## 🎯 Recommended Immediate Action

### Option A: Fix MongoDB Connection (Best)

1. Go to MongoDB Atlas Network Access
2. Add IP: **0.0.0.0/0**
3. Wait 2-3 minutes for it to apply
4. Run setup again

### Option B: Use Local MongoDB (Fastest)

1. Install MongoDB Community Edition locally
2. Change MONGODB_URI to `mongodb://localhost:27017/mgrandhub`
3. Run setup

### Option C: Deploy First, Setup Later

1. Deploy your services to Render first
2. Run setup from Render server (it will have better connectivity)
3. Or manually import via MongoDB Compass

---

## 📞 What to Do Now

Try this sequence:

```bash
# 1. Check your internet connection
ping 8.8.8.8

# 2. Try connecting to MongoDB Atlas directly
# Go to: https://cloud.mongodb.com
# Can you log in? Yes? Good!

# 3. Update Network Access
# Add 0.0.0.0/0 to IP whitelist

# 4. Wait 3 minutes, then try:
cd C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts
node setup-ca-tutorials-in-education-module.js
```

---

## 🆘 If Still Not Working

Let me know and I can:
1. Create a local-first setup that doesn't need MongoDB connection
2. Generate Render-ready deployment scripts
3. Create manual import instructions for MongoDB Compass

---

**Most likely fix: Add 0.0.0.0/0 to MongoDB Atlas Network Access and wait 3 minutes!**
