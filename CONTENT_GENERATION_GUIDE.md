# 🚀 Content Generation Guide - Week 5-8

## 📋 Overview

Generate **122 AI-powered lessons** across 4 educational tracks using automated scripts.

| Track | Lessons | Duration | Script |
|-------|---------|----------|--------|
| CA Foundation | 40 | ~60 min | `generate-ca-foundation.js` |
| JEE Main Physics | 30 | ~50 min | `generate-jee-physics.js` |
| CBSE Class 10 Math | 16 | ~25 min | `generate-cbse-10.js` |
| IAS Prelims | 36 | ~70 min | `generate-ias-prelims.js` |
| **TOTAL** | **122** | **~3.5 hours** | `generate-all-content.js` |

---

## 🛠️ Prerequisites

### 1. Backend Running
```bash
cd services/education-service
npm install
npm start
# Should run on http://localhost:3003
```

### 2. API Keys Configured
Ensure your `.env` file has:
```env
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Scripts Dependencies
```bash
cd scripts
npm install
```

---

## 🎯 Quick Start (Generate All 122 Lessons)

### Option 1: Run All at Once (Recommended)
```bash
cd scripts
node generate-all-content.js
```

This will:
- Generate CA Foundation (40 lessons)
- Generate JEE Main Physics (30 lessons)  
- Generate CBSE Class 10 Math (16 lessons)
- Generate IAS Prelims (36 lessons)
- Create master summary
- Take ~3.5 hours total

### Option 2: Run Individual Scripts
```bash
# CA Foundation (40 lessons)
node generate-ca-foundation.js

# JEE Main Physics (30 lessons)
node generate-jee-physics.js

# CBSE Class 10 Math (16 lessons)
node generate-cbse-10.js

# IAS Prelims (36 lessons)
node generate-ias-prelims.js
```

### Option 3: Use npm scripts
```bash
# Generate all
npm run generate:all

# Generate individual courses
npm run generate:ca
npm run generate:jee
npm run generate:cbse
npm run generate:ias
```

---

## 📊 What Gets Generated

### For Each Lesson:
1. **📝 Text Content** (2,000-3,000 words)
   - Introduction
   - Detailed explanation
   - Examples
   - Key points
   - Summary

2. **🎧 Audio Lecture** (15-20 minutes)
   - Text-to-speech narration
   - MP3 format
   - Clear pronunciation

3. **🎥 Video Lecture** (15-20 minutes)
   - Slide-based presentation
   - Visual aids
   - MP4 format

4. **🎬 Animated Examples** (5 × 2-3 minutes each)
   - Problem-solving animations
   - Step-by-step visualizations
   - Concept illustrations

5. **❓ Practice Questions** (10-20 MCQs)
   - Multiple difficulty levels
   - Detailed explanations
   - Correct answers marked

---

## 📁 Output Structure

```
services/education-service/
├── generated-content/
│   ├── ca-foundation/
│   │   ├── accounting/
│   │   │   ├── lesson-1.json
│   │   │   ├── lesson-1-audio.mp3
│   │   │   ├── lesson-1-video.mp4
│   │   │   └── lesson-1-animations/ (5 files)
│   │   ├── business-laws/
│   │   ├── mathematics/
│   │   └── economics/
│   ├── jee-main/
│   │   └── physics/
│   ├── cbse-10/
│   │   └── mathematics/
│   └── ias-prelims/
│       ├── history/
│       ├── geography/
│       ├── polity/
│       └── economy/
└── database/ (MongoDB records)
```

---

## 📈 Progress Tracking

### During Generation:
```
==========================================================
🎓 Course: CA Foundation - Principles of Accounting
==========================================================
✓ Course created: 507f1f77bcf86cd799439011

  📖 [1/10] Introduction to Accounting
     ✓ Lesson ID: 507f191e810c19729de860ea
     ✓ Content: 2543 characters
     ✓ Questions: 15

  📖 [2/10] Accounting Process
     ✓ Lesson ID: 507f191e810c19729de860eb
     ✓ Content: 2688 characters
     ✓ Questions: 18
```

### Summary Files Created:
- `generation-summary.json` - CA Foundation details
- `jee-physics-summary.json` - JEE Physics details
- `cbse-10-summary.json` - CBSE Class 10 details
- `ias-prelims-summary.json` - IAS Prelims details
- `master-summary.json` - Overall statistics

---

## ✅ Validation

### Validate Generated Content:
```bash
cd scripts
node validate-content.js
```

### Validation Checks:
- ✅ All expected lessons present
- ✅ Content length (>1,500 words)
- ✅ Sufficient questions (>5 per lesson)
- ✅ Valid media URLs
- ✅ No missing data

### Sample Output:
```
🔍 CONTENT VALIDATION
==========================================================

📚 Validating: CA Foundation
   Expected Lessons: 40
   ✓ Course found: CA Foundation - Accounting
   📖 Lessons: 40/40
   ✓ Valid Lessons: 40/40

📊 VALIDATION SUMMARY
==========================================================
⏱️  Validation Time: 45 seconds
📚 Courses Validated: 4/4
📖 Total Lessons: 122/122 (100.0%)
✅ Valid Lessons: 122/122 (100.0%)
⚠️  Total Issues: 0
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused to localhost:3003"
**Solution**: Start the backend first
```bash
cd services/education-service
npm start
```

### Issue: "API rate limit exceeded"
**Solution**: Scripts have built-in delays. Wait and retry.

### Issue: "Some lessons failed to generate"
**Solution**: Check `generation-errors.log` and re-run the specific script

### Issue: "Low quality content"
**Solution**: 
1. Check API keys are valid
2. Ensure sufficient API quota
3. Re-generate specific lessons

---

## 📊 Expected Results

### Content Statistics:
- **Total Lessons**: 122
- **Total Questions**: 1,830+ (15 avg per lesson)
- **Audio Files**: 122 (15-20 min each)
- **Video Files**: 122 (15-20 min each)
- **Animation Files**: 610 (5 per lesson)
- **Total Storage**: ~18 GB

### Time Breakdown:
- **CA Foundation**: 60 minutes (40 lessons)
- **JEE Physics**: 50 minutes (30 lessons)
- **CBSE Class 10**: 25 minutes (16 lessons)
- **IAS Prelims**: 70 minutes (36 lessons)
- **Cooling Periods**: 15 minutes (between courses)
- **Total**: 220 minutes (~3.5 hours)

---

## 🎯 Quality Checks

### After Generation:
1. **Content Review** (Sample 10%)
   - Read 12 random lessons
   - Verify accuracy
   - Check language quality

2. **Media Check** (Sample 5%)
   - Play 6 random audio files
   - Watch 6 random videos
   - Check clarity and quality

3. **Questions Validation** (Sample 10%)
   - Answer 180+ questions
   - Verify correct answers
   - Check explanations

4. **Frontend Testing**
   - Enroll in courses
   - Complete 1 lesson per track
   - Take 1 practice test
   - Use AI tutor

---

## 📝 Generation Logs

### Log Files Created:
- `generation-errors.log` - Any errors encountered
- `generation-summary.json` - CA Foundation summary
- `jee-physics-summary.json` - JEE Physics summary
- `cbse-10-summary.json` - CBSE Class 10 summary
- `ias-prelims-summary.json` - IAS Prelims summary
- `master-summary.json` - Overall summary
- `validation-report.json` - Validation results

### Check Logs:
```bash
# View errors
cat generation-errors.log

# View CA Foundation summary
cat generation-summary.json | jq

# View master summary
cat master-summary.json | jq
```

---

## 🔄 Re-generating Content

### Re-run Specific Course:
```bash
# Delete old data first (optional)
# Then re-run the script
node generate-ca-foundation.js
```

### Re-run Specific Lesson:
Edit the script to generate only specific lesson indices.

---

## 💾 Backup Strategy

### After Each Course:
```bash
# Backup generated content
tar -czf backup-ca-foundation-$(date +%Y%m%d).tar.gz \
  services/education-service/generated-content/ca-foundation/

# Backup summaries
cp scripts/*-summary.json backups/
```

### Final Backup:
```bash
# Backup all generated content
tar -czf content-complete-$(date +%Y%m%d).tar.gz \
  services/education-service/generated-content/

# Upload to cloud storage
# aws s3 cp content-complete-*.tar.gz s3://bucket/
```

---

## 📊 Performance Optimization

### Parallel Generation (Advanced):
```bash
# Run multiple scripts in parallel (requires more resources)
node generate-ca-foundation.js &
node generate-jee-physics.js &
wait
```

### Batch Size Adjustment:
Edit scripts to change batch sizes:
```javascript
const batchSize = 5; // Smaller = more stable, Larger = faster
```

---

## 🎉 Success Criteria

### Week 5-8 Complete When:
- ✅ All 122 lessons generated
- ✅ All media files created
- ✅ All questions validated
- ✅ Validation shows 100% completion
- ✅ No critical errors in logs
- ✅ Frontend can load all content
- ✅ Sample lessons are high quality

---

## 🚀 Next Steps After Generation

### Week 9-10: Beta Testing
1. Invite 100 beta users
2. Monitor usage analytics
3. Collect feedback
4. Fix bugs
5. Improve content quality

### Week 11-12: Launch Preparation
1. Marketing materials
2. Press releases
3. Social media campaign
4. Final testing
5. **Public Launch** 🎊

---

## 📞 Support

### Need Help?
- Check `WEEK_5-8_CONTENT_GENERATION_PLAN.md`
- Review `generation-errors.log`
- Validate with `validate-content.js`
- Check backend logs

### Common Questions:

**Q: How long does it take?**
A: ~3.5 hours for all 122 lessons

**Q: Can I stop and resume?**
A: Yes, scripts can be run individually

**Q: What if a lesson fails?**
A: Check errors.log and re-run that script

**Q: How much storage needed?**
A: ~20 GB for all content

---

## 🎯 Quick Commands Reference

```bash
# Generate everything
cd scripts && node generate-all-content.js

# Generate individual courses
node generate-ca-foundation.js
node generate-jee-physics.js
node generate-cbse-10.js
node generate-ias-prelims.js

# Validate content
node validate-content.js

# Check summaries
ls -lh *-summary.json

# View errors
cat generation-errors.log

# Backup content
tar -czf backup.tar.gz ../services/education-service/generated-content/
```

---

**🎊 Ready to Generate 122 Lessons of AI-Powered Education! 🎊**

**Start Command:**
```bash
cd scripts
node generate-all-content.js
```

---

*Last Updated: July 18, 2026*  
*Status: Ready for Content Generation*  
*Estimated Completion: 3.5 hours*
