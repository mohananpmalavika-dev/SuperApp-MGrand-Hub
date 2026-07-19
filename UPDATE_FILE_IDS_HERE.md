# 🎯 UPDATE FILE IDs HERE

## After Uploading to Google Drive

Once you upload the 4 CA Foundation files to Google Drive and get their file IDs, update them in these 2 files:

---

## File 1: Setup Script

**Path**: `scripts/setup-ca-foundation-courses.js`

**Line 23-28**: Update this section:

```javascript
const DRIVE_FILE_IDS = {
  accounting: 'YOUR_ACCOUNTING_FILE_ID',           // ← Replace with real ID
  businessLaws: 'YOUR_BUSINESS_LAWS_FILE_ID',      // ← Replace with real ID
  businessMaths: 'YOUR_BUSINESS_MATHS_FILE_ID',    // ← Replace with real ID
  businessEconomics: 'YOUR_BUSINESS_ECONOMICS_FILE_ID' // ← Replace with real ID
};
```

**Example** (after you get IDs):
```javascript
const DRIVE_FILE_IDS = {
  accounting: '1ABC123xyz456DEF789ghi012JKL345',
  businessLaws: '1MNO678pqr901STU234vwx567YZA890',
  businessMaths: '1BCD345efg678HIJ901klm234NOP567',
  businessEconomics: '1QRS890tuv123WXY456zab789CDE012'
};
```

---

## File 2: Backend Mapping

**Path**: `services/education-service/src/config/ca-foundation-mapping.js`

**Line 8-13**: Update this section:

```javascript
const DRIVE_FILE_IDS = {
  accounting: 'YOUR_ACCOUNTING_FILE_ID',           // ← Replace with real ID
  businessLaws: 'YOUR_BUSINESS_LAWS_FILE_ID',      // ← Replace with real ID
  businessMaths: 'YOUR_BUSINESS_MATHS_FILE_ID',    // ← Replace with real ID
  businessEconomics: 'YOUR_BUSINESS_ECONOMICS_FILE_ID' // ← Replace with real ID
};
```

**Example** (same IDs as above):
```javascript
const DRIVE_FILE_IDS = {
  accounting: '1ABC123xyz456DEF789ghi012JKL345',
  businessLaws: '1MNO678pqr901STU234vwx567YZA890',
  businessMaths: '1BCD345efg678HIJ901klm234NOP567',
  businessEconomics: '1QRS890tuv123WXY456zab789CDE012'
};
```

---

## How to Get File IDs

### From Google Drive Web Interface:

1. **Right-click on file** → Click "Share" or "Get link"
2. **Copy the link**, it looks like:
   ```
   https://drive.google.com/file/d/1ABC123xyz456DEF789ghi012JKL345/view?usp=sharing
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is the File ID
   ```
3. **Extract the ID**: Everything between `/d/` and `/view`

### File → ID Mapping:

Upload these files and get IDs:

```
ca-f-accounting-complete.json
  ↓
  accounting: 'PASTE_ID_HERE'

ca-f-business-laws-complete.json
  ↓
  businessLaws: 'PASTE_ID_HERE'

ca-f-business-mathematics-complete.json
  ↓
  businessMaths: 'PASTE_ID_HERE'

ca-f-business-economics-complete.json
  ↓
  businessEconomics: 'PASTE_ID_HERE'
```

---

## After Updating File IDs

### Run Setup Script:

```bash
cd C:\Users\Dhanya\SuperApp-MGrand-Hub
node scripts/setup-ca-foundation-courses.js
```

**This will**:
- ✅ Connect to MongoDB
- ✅ Create/update 4 CA Foundation course records
- ✅ Link each course to its Google Drive file
- ✅ Display summary of created courses

### Restart Backend (if running):

```bash
# Stop current backend (Ctrl+C)
cd services/education-service
npm start
```

### Test Frontend:

```bash
# Navigate to course browser
http://localhost:3000/education/courses

# You should see 4 CA Foundation courses!
```

---

## Quick Checklist

- [ ] Upload 4 files to Google Drive
- [ ] Make files public ("Anyone with link can view")
- [ ] Copy 4 file IDs from Drive
- [ ] Update `scripts/setup-ca-foundation-courses.js` line 23-28
- [ ] Update `services/education-service/src/config/ca-foundation-mapping.js` line 8-13
- [ ] Run: `node scripts/setup-ca-foundation-courses.js`
- [ ] Restart backend if running
- [ ] Open: `http://localhost:3000/education/courses`
- [ ] Test: Click course → Click lesson → See content!

---

## Testing Single File First?

If you want to test with just one file (Accounting) first:

1. Upload only `ca-f-accounting-complete.json`
2. Get its file ID
3. Update only the `accounting` field in both files
4. Run setup script
5. Test with Accounting course (12 lessons)
6. If working, upload other 3 files and update their IDs

---

## Need Help?

**Can't find file ID?**
- Share the full Google Drive link with me
- I'll extract the ID for you

**Setup script fails?**
- Check MongoDB is running
- Check backend .env has correct MONGODB_URI

**Frontend doesn't show courses?**
- Check backend is running (port 3013)
- Check browser console for errors
- Verify setup script ran successfully

---

## Ready to Update?

Once you have the file IDs, just:
1. Open the 2 files mentioned above
2. Replace `YOUR_*_FILE_ID` with actual IDs
3. Save both files
4. Run setup script
5. Done! 🎉
