# MongoDB Connection Troubleshooting

## ❌ Current Issue
`querySrv ECONNREFUSED _mongodb._tcp.cluster0.5kqyosa.mongodb.net`

This error means your system cannot resolve the MongoDB Atlas DNS hostname.

## 🔍 Diagnosis Steps

### Step 1: Check Internet Connectivity
```bash
ping google.com
```

### Step 2: Test DNS Resolution
```bash
nslookup cluster0.5kqyosa.mongodb.net
```

### Step 3: Check if Firewall is Blocking
- Windows Firewall might be blocking DNS SRV lookups
- Antivirus software might be blocking MongoDB connections

### Step 4: Check MongoDB Atlas Settings
1. Go to https://cloud.mongodb.com
2. Select your cluster (Cluster0)
3. Click "Network Access" in the left menu
4. **Add your IP address to whitelist:**
   - Click "Add IP Address"
   - Click "Add Current IP Address" (or add `0.0.0.0/0` for testing - allows all IPs)
   - Click "Confirm"

## 🔧 Solutions

### Solution 1: Whitelist Your IP (RECOMMENDED)
1. Go to MongoDB Atlas → Network Access
2. Add current IP address or use `0.0.0.0/0` (allow from anywhere)
3. Wait 1-2 minutes for changes to apply
4. Restart backend: `npm start`

### Solution 2: Use Direct Connection String (if DNS is blocked)
Instead of the SRV connection string, try a direct connection:
```
mongodb://mgdhanyamohan_db_user:YOUR_PASSWORD@cluster0-shard-00-00.5kqyosa.mongodb.net:27017,cluster0-shard-00-01.5kqyosa.mongodb.net:27017,cluster0-shard-00-02.5kqyosa.mongodb.net:27017/superappmango?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Solution 3: Temporarily Disable Firewall/Antivirus
- Temporarily disable Windows Firewall to test
- Disable antivirus temporarily to test
- If this works, add exception for Node.js in firewall/antivirus

### Solution 4: Use VPN
- Some networks block MongoDB Atlas
- Try connecting through a VPN

### Solution 5: Use Local MongoDB (for development)
Install MongoDB locally:
```bash
# Using Chocolatey
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

Then update `.env`:
```
MONGO_URI=mongodb://localhost:27017/superappmango
```

## 🚀 Next Steps

**Recommended approach:**
1. Check MongoDB Atlas Network Access settings (whitelist IP)
2. If that doesn't work, try disabling firewall temporarily
3. If still failing, use local MongoDB for development

## 📝 Test Connection
After making changes, test with:
```bash
cd services/education-service
node test-mongo-connection.js
```

## ⚠️ Important
Once MongoDB is connected, you can run content generation:
```bash
cd scripts
node generate-all-content.js
```
