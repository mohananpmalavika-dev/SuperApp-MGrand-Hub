# 🎯 IMPORT YOUR GOOGLE DRIVE COURSES NOW!

## ✅ What You Have

Your Google Drive folder contains **8 course files** ready to import!

**Folder:** https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

---

## 🚀 Quick Import (3 Steps)

### Step 1: Check Content
```bash
cd scripts
npm run check:drive
```

This opens Google Drive in your browser.

### Step 2: Download Files
In the Google Drive folder that opened:
1. Select all JSON files (hold Ctrl and click each one)
2. Right-click → Download
3. Move downloaded files to: `scripts/google-drive-content/`

**Files to download:**
- ca-f-acc.json
- ca-f-eco.json  
- ca-f-law.json
- ca-f-maths.json
- cbse-10-math.json
- ias-prelims.json
- jee-m-phy.json
- manifest.json

### Step 3: Import to MongoDB
```bash
npm run import:courses
```

**What happens:**
- ✅ Connects to MongoDB
- ✅ Parses each JSON file
- ✅ Creates course records
- ✅ Makes content available via API

**Expected output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB!

📦 Processing: ca-f-acc.json
   Size: 93.00 KB
   ✅ Imported: CA Foundation - Accounting
      Modules: 12

📦 Processing: ca-f-eco.json
   Size: 82.00 KB
   ✅ Imported: CA Foundation - Economics
      Modules: 10

... (continues for all files)

═══════════════════════════════════════
🎉 IMPORT COMPLETE!
═══════════════════════════════════════
✅ Imported: 7 courses
❌ Failed: 0 courses

📊 Total courses in database: 7
```

---

## 📊 After Import

Your courses will be accessible at:

```
GET http://localhost:3013/api/education/courses
```

**Example response:**
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "_id": "...",
      "courseTitle": "CA Foundation - Accounting",
      "examType": "CA_FOUNDATION",
      "subject": "Accounting",
      "level": "FOUNDATION",
      "modules": [...]
    },
    ...
  ]
}
```

---

## 🔄 Alternative: If Files Are Already Downloaded

If you already have the files in `scripts/google-drive-content/`:

```bash
cd scripts
npm run import:courses
```

That's it! Skip the download step.

---

## ✅ Verification

After import, test the API:

```bash
# In a new terminal or browser:
curl http://localhost:3013/api/education/courses

# Or open in browser:
http://localhost:3013/api/education/courses
```

You should see all 7 courses!

---

## 📁 Directory Structure

After setup:
```
scripts/
├── google-drive-content/       ← Download files here
│   ├── ca-f-acc.json
│   ├── ca-f-eco.json
│   ├── ca-f-law.json
│   ├── ca-f-maths.json
│   ├── cbse-10-math.json
│   ├── ias-prelims.json
│   ├── jee-m-phy.json
│   └── manifest.json
└── import-from-drive-to-mongodb.js  ← Import script
```

---

## 💡 Troubleshooting

### "Content directory not found"
**Solution:** Create the directory and download files:
```bash
mkdir scripts\google-drive-content
# Then download files from Google Drive
```

### "MongoDB connection failed"
**Solution:** Make sure backend is running:
```bash
cd services\education-service
npm start
```

### "Course already exists"
**Solution:** This is normal! The script will update existing courses.

---

## 🎉 Success!

Once imported:
- ✅ 7 courses in MongoDB
- ✅ Accessible via API
- ✅ Ready for your frontend
- ✅ Fast database queries
- ✅ Google Drive as backup

---

## 🚀 Ready? Start Import!

```bash
cd scripts
npm run check:drive        # Opens Google Drive
# Download files to google-drive-content/
npm run import:courses     # Import to MongoDB
```

**Let's make education accessible!** 🎓
