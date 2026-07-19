# 🎓 Access CA Tutorials in Your Project

## Complete Setup Guide to Access CA Foundation Tutorials

---

## 🎯 Quick Start (3 Steps)

### Step 1: Set MongoDB Connection
Make sure your MongoDB connection string is set in the scripts folder:

```bash
# Navigate to scripts folder
cd scripts

# Create/edit .env file
notepad .env
```

Add this line:
```env
MONGODB_URI=mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub?retryWrites=true&w=majority&appName=Cluster0
```

### Step 2: Run Setup Script
```bash
# From scripts folder
node setup-ca-tutorials-in-education-module.js
```

### Step 3: Access via API
Your CA tutorials are now available via your education service APIs!

---

## 📋 Detailed Steps

### 1️⃣ Verify Your Content Files

Check that these files exist:
```
C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts\google-drive-content\ca-f-accounting.json
C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts\google-drive-content\ca-f-business-economics.json
C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts\google-drive-content\ca-f-business-laws.json
C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts\google-drive-content\ca-f-business-mathematics.json
```

Open File Explorer and navigate to check:
```bash
explorer C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts\google-drive-content
```

✅ All 4 files should be there!

### 2️⃣ Set Up MongoDB Connection

The script needs to connect to your MongoDB database.

**Option A: Use Environment Variable**
```bash
cd scripts
echo MONGODB_URI=mongodb+srv://mgdhanyamohan_db_user:Thathu110@cluster0.5kqyosa.mongodb.net/mgrandhub?retryWrites=true&w=majority&appName=Cluster0 > .env
```

**Option B: Use Default (localhost)**
If you have MongoDB running locally, the script will use:
```
mongodb://localhost:27017/mgrand-hub
```

### 3️⃣ Run the Setup Script

```bash
# Navigate to scripts folder
cd C:\Users\Dhanya\SuperApp-MGrand-Hub\scripts

# Install dependencies (if not already done)
npm install

# Run the setup
node setup-ca-tutorials-in-education-module.js
```

### 4️⃣ Expected Output

You should see:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📚 Processing: CA Foundation - Accounting
   File: ca-f-accounting.json
   📖 Found 12 lessons
   ✨ Creating new course...
   ✅ Course created (ID: 6a5caa26f5ce74ecaa512ad2)
   📦 Organizing into 1 modules...
   📝 Module 1: 12 lessons
   ✅ CA Foundation - Accounting setup complete!

📚 Processing: CA Foundation - Business Economics
   ...

============================================================
🎉 CA FOUNDATION TUTORIALS SETUP COMPLETE!
============================================================
✅ Courses created: 4
✅ Lessons created: 42
✅ Total courses: 4

📚 CA Foundation Courses in Database:
   • CA Foundation - Accounting (12 lessons)
     ID: 6a5caa26f5ce74ecaa512ad2
     Price: ₹4999
   • CA Foundation - Business Economics (10 lessons)
     ID: 6a5caa27f5ce74ecaa512ad3
     Price: ₹3999
   ...

✅ Your CA tutorials are now accessible via the education module!
```

---

## 🚀 Access Your CA Tutorials

### Via API Endpoints

Your education service should now expose these endpoints:

#### 1. List All CA Foundation Courses
```http
GET /api/education/courses?examType=CA_FOUNDATION
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "6a5caa26f5ce74ecaa512ad2",
      "title": "CA Foundation - Accounting",
      "description": "Complete Accounting course...",
      "subject": "Accounting",
      "totalLessons": 12,
      "price": 4999,
      "thumbnail": "..."
    },
    ...
  ]
}
```

#### 2. Get Specific Course Details
```http
GET /api/education/courses/:courseId
```

Response includes:
- Course metadata
- All modules
- Lesson list

#### 3. Get Lesson Content
```http
GET /api/education/lessons/:lessonId
```

Response includes:
- Full lesson content
- Key concepts
- Examples
- Practice questions
- Exam tips
- Quick revision

#### 4. Search Courses
```http
GET /api/education/courses/search?q=accounting
```

---

## 📱 Access from Frontend

### Update Your Frontend Config

In your frontend, you can access CA tutorials like this:

```javascript
// src/services/educationService.js

import axios from 'axios';

const API_BASE = process.env.REACT_APP_EDUCATION_SERVICE_URL || 'http://localhost:3010/api/education';

// Get all CA Foundation courses
export const getCACourses = async () => {
  const response = await axios.get(`${API_BASE}/courses`, {
    params: { examType: 'CA_FOUNDATION' }
  });
  return response.data;
};

// Get course details
export const getCourseDetails = async (courseId) => {
  const response = await axios.get(`${API_BASE}/courses/${courseId}`);
  return response.data;
};

// Get lesson content
export const getLessonContent = async (lessonId) => {
  const response = await axios.get(`${API_BASE}/lessons/${lessonId}`);
  return response.data;
};
```

### Create a CA Courses Page

```javascript
// src/pages/education/CACourses.js

import React, { useEffect, useState } from 'react';
import { getCACourses } from '../../services/educationService';

function CACourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCACourses();
      setCourses(data.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading CA Courses...</div>;

  return (
    <div className="ca-courses">
      <h1>CA Foundation Courses</h1>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            <img src={course.thumbnail} alt={course.title} />
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p>{course.totalLessons} Lessons</p>
            <p>₹{course.price}</p>
            <button onClick={() => window.location.href = `/education/course/${course._id}`}>
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CACourses;
```

---

## 🗂️ Database Structure

After running the setup, your MongoDB will have:

### Collections:

**1. courses**
```javascript
{
  _id: ObjectId,
  title: "CA Foundation - Accounting",
  description: "...",
  category: "Professional",
  examType: "CA_FOUNDATION",
  subject: "Accounting",
  level: "Foundation",
  totalLessons: 12,
  modules: [
    {
      moduleNumber: 1,
      title: "Module 1",
      lessons: [ObjectId, ObjectId, ...]
    }
  ],
  price: 4999,
  currency: "INR"
}
```

**2. lessons**
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref to Course),
  moduleNumber: 1,
  chapterNumber: 1,
  topic: "Introduction to Accounting",
  subject: "Accounting",
  duration: 45,
  introduction: "...",
  keyConcepts: [
    {
      concept: "Assets",
      definition: "...",
      explanation: "..."
    }
  ],
  detailedContent: "...",
  solvedExamples: [...],
  practicalExamples: [...],
  quickRevision: {
    summary: [...],
    formulas: [...],
    mnemonics: [...]
  },
  examTips: [...],
  commonMistakes: [...],
  videoUrl: "...",
  audioUrl: "..."
}
```

---

## 🔍 Testing the Setup

### 1. Check MongoDB

Use MongoDB Compass or mongo shell:
```bash
# Count courses
db.courses.countDocuments({ examType: "CA_FOUNDATION" })
# Should return 4

# Count lessons
db.lessons.countDocuments()
# Should return 42

# View a course
db.courses.findOne({ examType: "CA_FOUNDATION" })

# View a lesson
db.lessons.findOne()
```

### 2. Test API Endpoints

Using curl or Postman:
```bash
# List CA courses
curl http://localhost:3010/api/education/courses?examType=CA_FOUNDATION

# Get course details (replace with actual ID)
curl http://localhost:3010/api/education/courses/6a5caa26f5ce74ecaa512ad2

# Get lesson (replace with actual ID)
curl http://localhost:3010/api/education/lessons/6a5caa3bf5ce74ecaa512ae0
```

---

## 🎨 What Students Will See

### Course List
- 4 CA Foundation courses
- Each with subject name (Accounting, Economics, Laws, Maths)
- Price and lesson count
- Thumbnail images

### Course Detail Page
- Complete course description
- All modules listed
- All lessons listed
- Enroll/Purchase button

### Lesson Page
- Introduction
- Key concepts (3-5 per lesson)
- Detailed explanations
- Solved examples
- Practical examples
- Quick revision notes
- Exam tips
- Common mistakes
- Practice questions count
- Video/Audio player (if URLs provided)

---

## 🛠️ Troubleshooting

### Error: Cannot connect to MongoDB
**Solution**: 
- Check your `MONGODB_URI` in `.env`
- Verify MongoDB Atlas is accessible
- Check network/firewall settings

### Error: File not found
**Solution**:
- Verify JSON files exist in `scripts/google-drive-content/`
- Check file names match exactly

### Error: Courses already exist
**Solution**:
- This is normal on re-run
- The script will update existing courses
- No duplicate data is created

### Empty course list in frontend
**Solution**:
- Check education service is running
- Verify API endpoints are correct
- Check MongoDB has data
- Check CORS settings

---

## 📊 Summary

### What You Get:

✅ **4 Complete CA Foundation Courses**
- Accounting (12 lessons)
- Business Economics (10 lessons)  
- Business Laws (10 lessons)
- Business Mathematics (10 lessons)

✅ **42 Comprehensive Lessons** with:
- Detailed notes
- Key concepts
- Solved examples
- Practice questions
- Exam tips
- Quick revision

✅ **Ready-to-Use APIs** for:
- Listing courses
- Viewing course details
- Accessing lesson content
- Searching courses

✅ **Frontend Integration** ready
- Can be accessed from your React app
- API endpoints available
- Data structured for display

---

## 🎯 Next Steps

1. **Run the setup script** (see Step 3 above)
2. **Verify in MongoDB** (check courses and lessons)
3. **Test API endpoints** (use curl or Postman)
4. **Update frontend** (add CA courses page)
5. **Deploy** (deploy education service to production)

---

## 📞 Support

If you encounter issues:
1. Check the console output for errors
2. Verify MongoDB connection
3. Ensure all JSON files are present
4. Check education service is running

---

**Your CA Foundation tutorials are now fully integrated into your project! 🎉**

**Students can access them via your education module!** 📚
