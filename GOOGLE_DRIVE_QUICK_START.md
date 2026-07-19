# 🚀 Google Drive Integration - Quick Start

## ⚡ 3-Step Setup (5 Minutes)

### Step 1: Install Google Drive Package
```bash
cd scripts
npm install googleapis
```

### Step 2: Get Credentials

**Easy Way - Using Existing Project:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Desktop app"
4. Name it: "Content Generator"
5. Download JSON file
6. Save as: `scripts/credentials.json`

**Or follow detailed guide in:** `GOOGLE_DRIVE_SETUP.md`

### Step 3: Setup & Generate
```bash
# Setup (first time only)
node setup-google-drive.js

# Generate all content with Drive sync
node generate-with-drive.js
```

**That's it!** 🎉

---

## 📊 What Happens

### During Generation:
1. ✅ Generates 122 lessons locally (~3.5 hours)
2. ✅ After each course, uploads summary to Drive
3. ✅ Creates master summary at the end
4. ✅ Prints Drive links for easy access

### Your Drive Folder:
https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

### Files Uploaded:
```
summaries/
├── ca-foundation-summary-2026-07-18.json
├── jee-physics-summary-2026-07-18.json
├── cbse-10-summary-2026-07-18.json
├── ias-prelims-summary-2026-07-18.json
└── master-summary-2026-07-18.json
```

---

## 📱 Access Anywhere

### View Summaries:
- 💻 **Desktop**: Open Drive folder link
- 📱 **Mobile**: Google Drive app
- 🌐 **Web**: drive.google.com

### Share with Team:
1. Open your Drive folder
2. Click "Share"
3. Add email addresses
4. Choose permissions (Viewer/Editor)

---

## 🎯 Commands Reference

```bash
# Setup (first time only)
node setup-google-drive.js

# Generate with Drive sync (recommended)
node generate-with-drive.js

# Generate without Drive sync
node generate-all-content.js

# Check your Drive folder
open "https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw"
```

---

## 💡 Why Use Google Drive?

✅ **Cloud Backup** - Never lose progress  
✅ **Easy Sharing** - Share with team instantly  
✅ **Access Anywhere** - View from any device  
✅ **Version History** - Track all changes  
✅ **Auto Upload** - No manual work needed  

---

## 🔐 Security

Your credentials are safe:
- ✅ `credentials.json` - Only you have access
- ✅ `token.json` - Stored locally
- ✅ Already in `.gitignore` - Won't be committed
- ✅ OAuth authentication - Google's secure method

---

## 🐛 Quick Troubleshooting

**Problem**: "credentials.json not found"  
**Solution**: Download from Google Cloud Console and save to `scripts/credentials.json`

**Problem**: "Authentication failed"  
**Solution**: Delete `token.json` and run `node setup-google-drive.js` again

**Problem**: "Upload failed"  
**Solution**: Check internet connection and re-run script

---

## 🎊 That's All!

**Start generating content with automatic Drive backup:**
```bash
cd c:\Users\Dhanya\SuperApp-MGrand-Hub\scripts
node generate-with-drive.js
```

**Your summaries will appear here:**
https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

---

**📚 Need More Help?**
- Full guide: `GOOGLE_DRIVE_SETUP.md`
- Content guide: `CONTENT_GENERATION_GUIDE.md`
- Troubleshooting: `GOOGLE_DRIVE_SETUP.md#troubleshooting`

**🚀 Ready to generate 122 lessons with cloud backup!**
