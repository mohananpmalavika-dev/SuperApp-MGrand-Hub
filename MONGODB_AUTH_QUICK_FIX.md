# ⚡ MongoDB Auth Error - Quick Fix

## ❌ Error: "bad auth : authentication failed"

Your username or password in `MONGODB_URI` is wrong.

---

## 🎯 Quick Fix (3 Steps)

### 1. Reset Password in MongoDB Atlas

1. Go to: https://cloud.mongodb.com
2. Click **Database Access** (left sidebar)
3. Find your user → Click **Edit**
4. Click **Edit Password**
5. Click **Autogenerate Secure Password**
6. **COPY THE PASSWORD** (you won't see it again!)
7. Click **Update User**

### 2. Update Connection String

Your connection string format:
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DBNAME?retryWrites=true&w=majority
```

**Replace PASSWORD with the new password you just copied!**

Example:
```
mongodb+srv://myuser:abc123XYZ@cluster0.mongodb.net/superapp?retryWrites=true&w=majority
```

### 3. Update in Render

1. Render Dashboard → Your service → **Environment** tab
2. Find `MONGODB_URI` → Click **Edit**
3. Paste your updated connection string
4. Click **Save Changes**
5. Service will auto-redeploy (~2 min)

---

## ✅ Success

Logs will show:
```
✓ MongoDB connected successfully
✓ Service is running
```

---

## 🔐 Important Notes

### If password has special characters:

| Character | Use Instead |
|-----------|-------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |

**Easier:** Use password without special characters!

### Make sure:
- ✅ Username is correct
- ✅ Password is URL-encoded if it has special chars
- ✅ Database name is correct
- ✅ Network Access has `0.0.0.0/0` whitelisted

---

**See `FIX_MONGODB_AUTH.md` for detailed instructions**

**Fix your password now! 🚀**
