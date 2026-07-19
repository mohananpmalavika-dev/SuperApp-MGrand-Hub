# 🔗 Google Drive Integration Setup

## 📋 Overview

Generate all 122 lessons and automatically sync summaries to Google Drive for:
- ☁️ Cloud backup
- 📊 Easy review and sharing
- 💾 No local storage constraints
- 📱 Access from anywhere

**Your Drive Folder**: https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Google Drive Dependencies
```bash
cd scripts
npm install googleapis
```

### Step 2: Get Google Drive Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Click "Select a project" → "New Project"
   - Name: "MGrand Content Generator"
   - Click "Create"

3. **Enable Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Desktop app"
   - Name: "Content Generator"
   - Click "Create"

5. **Download Credentials**
   - Click "Download JSON"
   - Rename file to `credentials.json`
   - Move to: `scripts/credentials.json`

### Step 3: Run Setup Script
```bash
cd scripts
node setup-google-drive.js
```

This will:
1. Open browser for Google authorization
2. Create access token
3. Test connection to your Drive folder
4. Create folder structure
5. Save configuration

### Step 4: Generate Content with Drive Sync
```bash
node generate-with-drive.js
```

**Done!** Content will be generated and summaries auto-uploaded to Google Drive.

---

## 📁 Folder Structure Created

```
Your Drive Folder (1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw)/
├── ca-foundation/
│   └── summaries and content
├── jee-physics/
│   └── summaries and content
├── cbse-10-math/
│   └── summaries and content
├── ias-prelims/
│   └── summaries and content
└── summaries/
    ├── ca-foundation-summary-2026-07-18.json
    ├── jee-physics-summary-2026-07-18.json
    ├── cbse-10-summary-2026-07-18.json
    ├── ias-prelims-summary-2026-07-18.json
    └── master-summary-2026-07-18.json
```

---

## 🎯 What Gets Uploaded to Drive

### After Each Course Generation:
- ✅ Course summary JSON file
  - Lesson count
  - Question count
  - Duration
  - Course ID
  - Lesson details

### After Complete Generation:
- ✅ Master summary JSON file
  - All 4 course summaries
  - Total statistics
  - Generation time
  - Success/failure status

### What Stays Local:
- Full lesson content (too large for quick upload)
- Audio files
- Video files
- Animation files

**Pro Tip**: After validation, you can manually upload sample lessons to Drive for review.

---

## 🔧 Usage

### Generate All Content with Drive Sync:
```bash
cd scripts
node generate-with-drive.js
```

### Generate Individual Course with Drive Upload:
```bash
# Generate CA Foundation
node generate-ca-foundation.js

# Then upload summary manually
node -e "require('./setup-google-drive').authorize().then(auth => require('./setup-google-drive').uploadFile(auth, 'generation-summary.json', 'ca-foundation-summary.json'))"
```

### Check What's Been Uploaded:
Visit your Drive folder:
https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

---

## 📊 Benefits of Google Drive Integration

### 1. **Cloud Backup**
- Automatic backup after each generation
- No risk of losing progress
- Version history available

### 2. **Easy Sharing**
- Share folder with team members
- Review content together
- Collaborate on improvements

### 3. **Access Anywhere**
- View summaries from phone
- Check progress remotely
- Review on any device

### 4. **Storage Efficiency**
- Only summaries uploaded (not full content)
- ~5 MB total for all summaries
- Full content stays local (~18 GB)

### 5. **Progress Tracking**
- See exactly what's been generated
- Track completion status
- Monitor quality metrics

---

## 🔐 Security

### Your Credentials are Safe:
- ✅ `credentials.json` - Only you have this
- ✅ `token.json` - Stored locally, never shared
- ✅ OAuth flow - Secure Google authentication
- ✅ Limited scope - Only Drive file access

### .gitignore Already Configured:
```gitignore
scripts/credentials.json
scripts/token.json
scripts/drive-folders.json
```

These files won't be committed to Git.

---

## 📝 Files Created

### Local Configuration Files:
- `credentials.json` - OAuth credentials (keep secret!)
- `token.json` - Access token (auto-generated)
- `drive-folders.json` - Folder IDs mapping

### Scripts:
- `setup-google-drive.js` - Setup and configuration
- `generate-with-drive.js` - Generation with auto-upload

---

## 🐛 Troubleshooting

### Issue: "credentials.json not found"
**Solution**: 
1. Go to Google Cloud Console
2. Download OAuth credentials
3. Save as `scripts/credentials.json`

### Issue: "Invalid authentication"
**Solution**:
```bash
# Delete old token and re-authenticate
rm scripts/token.json
node setup-google-drive.js
```

### Issue: "File already exists"
**Solution**: Drive upload will create new version automatically

### Issue: "Upload failed"
**Solution**: 
1. Check internet connection
2. Verify Drive folder permissions
3. Re-run authentication

---

## 💡 Pro Tips

### 1. Test Connection First
```bash
node setup-google-drive.js
```
This verifies everything is working before generation.

### 2. Monitor Upload Progress
Watch the console for upload confirmations:
```
📤 Uploading ca-foundation-summary.json to Google Drive...
✅ Uploaded: ca-foundation-summary-2026-07-18.json
🔗 Link: https://drive.google.com/file/d/...
```

### 3. Manually Upload Specific Files
```bash
# Create a script to upload any file
node -e "
  const { authorize, uploadFile } = require('./setup-google-drive');
  authorize().then(auth => {
    uploadFile(auth, 'path/to/file.json', 'filename.json')
      .then(file => console.log('Uploaded:', file.webViewLink));
  });
"
```

### 4. Share Folder with Team
1. Go to your Drive folder
2. Click "Share"
3. Add team member emails
4. Set permissions (Viewer/Editor)

---

## 🎯 Quick Commands

```bash
# Install dependencies
cd scripts && npm install googleapis

# Setup Google Drive
node setup-google-drive.js

# Generate with Drive sync
node generate-with-drive.js

# Check Drive folder
open "https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw"
```

---

## 📊 Expected Results

### After Setup:
- ✅ Authenticated with Google Drive
- ✅ Connection tested
- ✅ Folder structure created
- ✅ Configuration saved

### After Generation:
- ✅ 122 lessons generated locally
- ✅ 5 summary files uploaded to Drive
- ✅ Master summary with all stats
- ✅ Access links printed in console

---

## 🎉 Benefits Summary

| Feature | Without Drive | With Drive |
|---------|--------------|------------|
| Backup | ❌ Local only | ✅ Cloud backup |
| Sharing | ❌ Manual | ✅ Automatic |
| Access | ❌ One device | ✅ Any device |
| Review | ❌ Local files | ✅ Drive preview |
| Collaboration | ❌ Difficult | ✅ Easy sharing |
| Storage | ❌ 18 GB local | ✅ 5 MB Drive |

---

## 🚀 Ready to Start!

### Complete Setup in 3 Commands:
```bash
# 1. Install
npm install googleapis

# 2. Setup
node setup-google-drive.js

# 3. Generate
node generate-with-drive.js
```

**Your summaries will automatically upload to:**
https://drive.google.com/drive/folders/1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw

---

**🎊 Google Drive integration ready! Generate content with cloud backup!** 🚀
