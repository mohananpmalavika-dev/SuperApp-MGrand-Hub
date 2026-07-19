# 🔐 Fix MongoDB Authentication Error

## ❌ Error: "bad auth : authentication failed"

Your MongoDB URI is set, but the **username or password is incorrect**.

---

## 🎯 Quick Fix (2 Options)

### Option 1: Fix Your MongoDB Password

#### Step 1: Go to MongoDB Atlas
1. Visit: https://cloud.mongodb.com
2. Log in to your account
3. Select your project

#### Step 2: Check/Reset Database User Password
1. Click **Database Access** (left sidebar)
2. Find your database user
3. Click **Edit**
4. Click **Edit Password**
5. Choose:
   - **Autogenerate Secure Password** (recommended), OR
   - Set your own password
6. **Copy the new password** immediately!
7. Click **Update User**

#### Step 3: Update Connection String in Render
1. Go to Render Dashboard
2. Click your service (user-service or tutor-service)
3. Click **Environment** tab
4. Find `MONGODB_URI`
5. Click **Edit**
6. Update the connection string with new password:
   ```
   mongodb+srv://username:NEW_PASSWORD_HERE@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
7. Click **Save Changes**
8. Service will auto-redeploy

---

### Option 2: Create New Database User

#### Step 1: Create New User in MongoDB Atlas
1. Go to MongoDB Atlas
2. Click **Database Access**
3. Click **Add New Database User**
4. Choose **Password** authentication
5. Set username (e.g., `renderuser`)
6. Set password (or autogenerate)
7. **Copy username and password**
8. Set privileges: **Built-in Role** → **Atlas admin** (or **Read and write to any database**)
9. Click **Add User**

#### Step 2: Get New Connection String
1. Click **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<username>` with your new username
6. Replace `<password>` with your new password
7. Replace `<dbname>` with your database name (e.g., `superapp`)

#### Example:
```
mongodb+srv://renderuser:MyNewPassword123@cluster0.abc123.mongodb.net/superapp?retryWrites=true&w=majority
```

#### Step 3: Update in Render
1. Go to Render Dashboard
2. Click your service
3. Click **Environment** tab
4. Update `MONGODB_URI` with new connection string
5. Save

---

## 🔍 Common Issues

### Issue 1: Special Characters in Password
If your password contains special characters like `@`, `#`, `%`, etc., they need to be URL encoded:

| Character | Encode As |
|-----------|-----------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `/` | `%2F` |
| `=` | `%3D` |
| `?` | `%3F` |

**Example:**
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`

**Or simpler:** Use a password without special characters!

### Issue 2: Wrong Database Name
Make sure the database name in your connection string matches:
```
mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME?retryWrites=true
                                                   ↑
                                        This must match your database
```

### Issue 3: User Doesn't Have Permissions
In MongoDB Atlas:
1. Go to **Database Access**
2. Edit your user
3. Ensure role is **Atlas admin** or **Read and write to any database**

---

## ✅ After Fixing

### Your service will:
1. ✅ Connect to MongoDB successfully
2. ✅ Start without errors
3. ✅ Health check passes

### Check Logs:
You should see:
```json
{"level":"info","message":"Connecting to MongoDB..."}
{"level":"info","message":"MongoDB connected successfully"}
{"level":"info","message":"user-service listening on port 10000"}
```

---

## 🧪 Test Connection String Locally (Optional)

If you want to test your connection string before deploying:

```javascript
// test-mongo.js
const mongoose = require('mongoose');

const MONGODB_URI = 'your-connection-string-here';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
```

Run: `node test-mongo.js`

---

## 📋 Checklist

Before saving in Render:

- [ ] MongoDB Atlas user exists
- [ ] Password is correct
- [ ] Special characters in password are URL encoded (if any)
- [ ] Database name is correct
- [ ] User has read/write permissions
- [ ] IP whitelist includes `0.0.0.0/0` (allow all)
- [ ] Connection string format is correct

---

## 🎯 Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/DATABASE_NAME?retryWrites=true&w=majority
               ↑        ↑              ↑              ↑
               User     Pass         Host        DB Name
```

**Complete Example:**
```
mongodb+srv://myuser:MyPassword123@cluster0.mongodb.net/superapp?retryWrites=true&w=majority
```

**For Render (same string goes in MONGODB_URI):**
```
MONGODB_URI=mongodb+srv://myuser:MyPassword123@cluster0.mongodb.net/superapp?retryWrites=true&w=majority
```

---

## 🐛 Still Having Issues?

### Double-check:
1. ✅ Can you log into MongoDB Atlas with your credentials?
2. ✅ Is the cluster running (not paused)?
3. ✅ Did you whitelist `0.0.0.0/0` in Network Access?
4. ✅ Is the username exactly correct (case-sensitive)?
5. ✅ Is the password exactly correct (no extra spaces)?

### Get a Fresh Connection String:
1. MongoDB Atlas → Database → Connect → Connect your application
2. Copy the NEW connection string
3. Replace `<password>` with actual password
4. Replace `test` with your database name
5. Use this in Render

---

## 🎉 Once Fixed

Your service will start successfully and you'll see:

```
✓ MongoDB connected successfully
✓ user-service listening on port 10000
✓ Service is live!
```

---

**Fix your MongoDB password and update MONGODB_URI in Render now!** 🚀
