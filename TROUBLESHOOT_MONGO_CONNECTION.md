# 🔍 Troubleshoot MongoDB Connection

## Updated Code - Better Error Messages

I've updated the code to show more detailed error messages. Now redeploy and check the logs.

---

## 🎯 Steps to Troubleshoot

### 1. Redeploy with Latest Code

In Render Dashboard:
1. Go to **tutor-service**
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment
4. Check the logs carefully

### 2. Look for These Messages in Logs

You should now see:
```
Attempting MongoDB connection to: mongodb+srv://mgdhanyamohan_db_user:****@cluster0.5kqyosa.mongodb.net/...
```

And if it fails, you'll see details like:
- Error message
- Error code
- Error name

---

## 🔐 Common Issues to Check

### 1. Is MONGODB_URI Actually Set?

Double-check in Render:
- Environment tab
- Look for `MONGODB_URI`
- Make sure it's **not empty**
- Make sure there are **no extra spaces**

### 2. Is the Connection String Correct?

It should be **exactly**:
```
mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub?retryWrites=true&w=majority&appName=Cluster0
```

Check for:
- ✅ No spaces at beginning or end
- ✅ Password is `Thathu110` (no extra characters)
- ✅ Username is `mgdhanyamohan_db_user`
- ✅ Cluster is `cluster0.5kqyosa.mongodb.net`

### 3. MongoDB Atlas Network Access

Go to MongoDB Atlas:
1. Click **Network Access** (left sidebar)
2. Make sure you have: **0.0.0.0/0** (Allow access from anywhere)
3. If not, click **Add IP Address** → **Allow Access from Anywhere** → Confirm

### 4. MongoDB Atlas Database User

Go to MongoDB Atlas:
1. Click **Database Access**
2. Find user: `mgdhanyamohan_db_user`
3. Make sure:
   - ✅ Status is **Active** (not disabled)
   - ✅ Password is correct
   - ✅ Privileges: **Atlas admin** or **Read and write to any database**

---

## 🧪 Test Connection String Locally (Optional)

Create a test file to verify the connection string works:

```javascript
// test-connection.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing connection...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
```

Run: `node test-connection.js`

---

## 📋 Checklist Before Redeploying

- [ ] MONGODB_URI is set in Render Environment tab
- [ ] Connection string has no extra spaces
- [ ] Password is exactly: `Thathu110`
- [ ] Username is exactly: `mgdhanyamohan_db_user`
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] MongoDB user is active with correct permissions
- [ ] Latest code is pushed to GitHub
- [ ] Ready to redeploy

---

## 🚀 Next Steps

1. **Verify** environment variables in Render are correct
2. **Redeploy** to get better error messages
3. **Check logs** for specific error details
4. **Share** the new error message with me if it still fails

---

## 💡 Alternative: Try Simple Connection First

If still failing, try this **simpler connection string** without extra options:

```
mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub
```

Add this as MONGODB_URI and redeploy.

---

**Redeploy now to see detailed error messages! 🔍**
