# 🗑️ MongoDB Data Cleanup Guide

## Available Cleanup Scripts

I've created two cleanup scripts for you:

### 1. **cleanup-study-data.js** (RECOMMENDED)
Deletes only study-related data (courses, sessions, quizzes, etc.)
- ✅ Keeps user accounts
- ✅ Keeps authentication data
- ✅ Safer option

### 2. **cleanup-all-data.js** (DANGEROUS)
Deletes ALL data including users
- ⚠️ Deletes everything
- ⚠️ Cannot be undone
- ⚠️ Use only for complete reset

---

## How to Use

### Option 1: Cleanup Study Data Only (Recommended)

This removes all study material but keeps users and auth data.

#### Step 1: Set Environment Variable
Make sure your `.env` file has MongoDB connection:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

Or set it temporarily:
```powershell
# PowerShell
$env:MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

#### Step 2: Run the Script
```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
node scripts/cleanup-study-data.js
```

#### What It Deletes:
- Tutor sessions
- Quizzes
- Learning paths
- Courses
- Lessons
- Enrollments
- Progress data
- Study plans
- Assessments
- Certificates
- Flashcards
- Notes
- Bookmarks

#### What It Keeps:
- ✅ User accounts
- ✅ Authentication data
- ✅ User profiles
- ✅ Payment records (if any)

---

### Option 2: Complete Database Wipe (Dangerous)

**⚠️ WARNING: This deletes EVERYTHING including users!**

#### Run the Script
```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
node scripts/cleanup-all-data.js
```

This deletes:
- ❌ All users
- ❌ All study material
- ❌ All sessions
- ❌ Everything in the database

---

## Safety Features

Both scripts have safety features:

### 5-10 Second Delay
- **Study data cleanup**: 5 second countdown
- **Complete wipe**: 10 second countdown
- Press `Ctrl+C` to cancel during countdown

### Connection String Masking
- Passwords are hidden in console output
- Shows: `mongodb+srv://user:****@cluster...`

### Detailed Logging
- Shows what collections exist
- Reports how many documents deleted
- Displays summary at the end

---

## Example Output

```
⚠️  WARNING ⚠️  WARNING ⚠️  WARNING 
⚠️  This script will DELETE ALL study material data from MongoDB!
⚠️  This action CANNOT be undone!

Collections that will be cleaned:
  - tutorsessions
  - quizzes
  - learningpaths
  - courses
  - lessons
  ...

Starting cleanup in 5 seconds...
Press Ctrl+C to cancel

🔌 Connecting to MongoDB...
📍 URI: mongodb+srv://user:****@cluster.mongodb.net/dbname
✅ Connected to MongoDB

📦 Found collections: users, tutorsessions, quizzes, courses

🗑️  Deleting 15 documents from 'tutorsessions'...
   ✅ Deleted 15 documents
🗑️  Deleting 23 documents from 'quizzes'...
   ✅ Deleted 23 documents
⚪ Collection 'learningpaths' is already empty

============================================================
🎉 Cleanup completed!
   Collections cleaned: 2
   Total documents deleted: 38
============================================================

🔌 Database connection closed
✅ Script completed successfully
```

---

## Troubleshooting

### Error: MONGODB_URI not set
**Solution:** Set the environment variable:
```powershell
$env:MONGODB_URI="your-mongodb-connection-string"
```

### Error: Cannot connect to MongoDB
**Solutions:**
1. Check your internet connection
2. Verify MongoDB Atlas IP whitelist (should allow `0.0.0.0/0`)
3. Check username/password in connection string
4. Verify database exists

### Error: Collection not found
**Solution:** This is normal - the script skips collections that don't exist

### Script hangs during execution
**Solution:** 
1. Press `Ctrl+C` to cancel
2. Check MongoDB Atlas for connection issues
3. Try again with stable internet

---

## Running from Different Locations

### From Project Root:
```bash
node scripts/cleanup-study-data.js
```

### From Scripts Directory:
```bash
cd scripts
node cleanup-study-data.js
```

### Using npm script (add to package.json):
```json
{
  "scripts": {
    "cleanup:study": "node scripts/cleanup-study-data.js",
    "cleanup:all": "node scripts/cleanup-all-data.js"
  }
}
```

Then run:
```bash
npm run cleanup:study
```

---

## MongoDB Connection Strings

### For Local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/mgrand-hub
```

### For MongoDB Atlas (Production):
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mgrand-hub?retryWrites=true&w=majority
```

### For Different Databases:
```
# Tutor Service
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tutor-db

# Education Service  
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/education-db
```

---

## Best Practices

### 1. Backup First (Optional)
If you want to be extra safe, backup your data:
1. Go to MongoDB Atlas
2. Click your cluster
3. Go to "Backups" tab
4. Create an on-demand snapshot

### 2. Test on Development First
Run the script on a development database first:
```powershell
$env:MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dev-db"
node scripts/cleanup-study-data.js
```

### 3. Verify Results
After cleanup:
1. Check MongoDB Atlas
2. Go to Collections
3. Verify data is deleted
4. Test your app to ensure it handles empty state

### 4. Consider Selective Cleanup
If you want to keep some data, modify the script:
```javascript
// In cleanup-study-data.js, comment out collections to keep:
const COLLECTIONS_TO_DELETE = [
  'tutorsessions',
  'quizzes',
  // 'courses', // Keep courses
  // 'lessons', // Keep lessons
];
```

---

## After Cleanup

### Your App Should:
- ✅ Load without errors
- ✅ Show empty states (0 sessions, 0 courses, etc.)
- ✅ Allow creating new data
- ✅ Work normally from scratch

### Test These:
1. Dashboard loads (shows 0 stats)
2. Can create new session
3. Can generate new course
4. Can take quiz
5. Progress tracking works

---

## FAQ

**Q: Will this delete my users?**
A: Not if you use `cleanup-study-data.js`. Use `cleanup-all-data.js` only if you want to delete users too.

**Q: Can I undo this?**
A: No, deletions are permanent. Only restore option is if you made a backup in MongoDB Atlas.

**Q: How long does it take?**
A: Usually 5-30 seconds depending on how much data exists.

**Q: Will this affect my production site?**
A: Only if you use the production database connection string. Be careful!

**Q: Can I run this on Render/deployed services?**
A: You can, but connect to the production database. Better to run locally with production connection string.

---

## Quick Reference

### Study Data Only:
```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
node scripts/cleanup-study-data.js
```

### Complete Wipe:
```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub
node scripts/cleanup-all-data.js
```

### Cancel Script:
```
Press Ctrl+C during countdown
```

---

**⚠️ Remember:** Always double-check which database you're connected to before running cleanup scripts!
