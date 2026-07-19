# 🚀 Quick Start - Frontend Running Guide

## ✅ Frontend Complete! Let's Run It

---

## 📋 Prerequisites

### 1. Check Node.js
```bash
node --version  # Should be v16+ or v18+
npm --version   # Should be v8+
```

### 2. Check Backend Status
```bash
# Backend should be running on port 3003
# Check if education service is up:
curl http://localhost:3003/api/education/health
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies (First Time Only)
```bash
cd frontend
npm install
```

**This installs:**
- React & React DOM
- Redux Toolkit
- Material-UI
- Recharts
- React Player
- React Markdown
- Socket.io Client
- Axios

**Time:** ~2 minutes

---

### Step 2: Configure Environment
```bash
# Create .env file in frontend folder
echo REACT_APP_API_URL=http://localhost:3003/api/education > .env
```

---

### Step 3: Start Development Server
```bash
npm start
```

**Output:**
```
Compiled successfully!

You can now view mgrand-hub-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Time:** ~30 seconds

---

### Step 4: Open in Browser
Navigate to: **http://localhost:3000/education/dashboard**

**You should see:**
- ✅ Dashboard with stats cards
- ✅ Weekly study chart
- ✅ Course progress section
- ✅ Navigation sidebar

---

## 🎨 What You Can Do Now

### 1. Explore the Dashboard
**URL:** http://localhost:3000/education/dashboard

**Features:**
- View stats (courses, lessons, questions, streak)
- See weekly study time chart
- Check subject progress
- Quick actions (Take Test, View Progress, AI Tutor)

---

### 2. Browse Courses
**URL:** http://localhost:3000/education/courses

**Try:**
- Switch between grid/list view
- Search for courses
- Filter by category (CA, IAS, JEE, School)
- Click on a course card

---

### 3. View Course Details
**URL:** http://localhost:3000/education/course/test-course-id

**Features:**
- Course overview
- Curriculum with expandable modules
- Enroll in course
- View course features

---

### 4. Watch a Lesson
**URL:** http://localhost:3000/education/lesson/test-lesson-id

**Try:**
- Play video
- Switch tabs (Notes, Animations, Audio, Practice)
- Navigate course structure in sidebar
- Go to next/previous lesson

---

### 5. Practice Questions
**URL:** http://localhost:3000/education/practice

**Try:**
- Answer MCQ questions
- Submit answer
- View instant feedback
- Use hint system
- Track progress

---

### 6. Take a Test
**URL:** http://localhost:3000/education/tests

**Try:**
- View available tests
- Start a test
- See results with pie chart

---

### 7. Chat with AI Tutor
**URL:** http://localhost:3000/education/tutor

**Try:**
- Send a message
- Click suggested questions
- Upload an image (structure ready)
- View message history

---

### 8. View Progress
**URL:** http://localhost:3000/education/progress

**Features:**
- Weekly performance chart
- Subject mastery bars
- Study streak counter
- Key metrics

---

### 9. Edit Profile
**URL:** http://localhost:3000/education/profile

**Try:**
- Edit user information
- Select target exam
- Set study goals
- Toggle preferences

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Option 1: Use different port
PORT=3001 npm start

# Option 2: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

---

### Issue: Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: API connection failed
```bash
# Check backend is running
curl http://localhost:3003/api/education/health

# If not running, start backend:
cd services/education-service
npm start
```

---

### Issue: Blank page
```bash
# Check browser console (F12)
# Clear browser cache
# Check .env file exists with correct API_URL
```

---

## 🔧 Development Tips

### Hot Reload
Changes to React files will auto-reload the browser.
**No need to restart** `npm start`

### Redux DevTools
Install Redux DevTools browser extension to inspect state:
- Chrome: https://chrome.google.com/webstore (search "Redux DevTools")
- Firefox: https://addons.mozilla.org

### React DevTools
Install React DevTools for component inspection:
- Chrome/Firefox: Search for "React Developer Tools"

---

## 📦 Build for Production

### Create Production Build
```bash
cd frontend
npm run build
```

**Output:** `frontend/build/`

**Contains:**
- Optimized HTML, CSS, JS
- Minified bundle
- Source maps
- Asset files

### Test Production Build Locally
```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s build

# Opens on http://localhost:3000
```

---

## 🎯 Next Steps

### 1. Generate Content (Week 5-8)
Now that frontend is working, generate courses:

```bash
# Start backend
cd services/education-service
npm start

# Test course generation
curl -X POST http://localhost:3003/api/education/courses/generate \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "CA Foundation - Accounting",
    "category": "professional",
    "difficulty": "intermediate"
  }'
```

---

### 2. Deploy to Production (Week 9-12)

#### Frontend Deployment Options:
1. **Vercel** (Recommended for React)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **AWS S3 + CloudFront**
   ```bash
   npm run build
   aws s3 sync build/ s3://your-bucket
   ```

---

## ✅ Verification Checklist

After starting the frontend, verify:

- [ ] Dashboard loads at /education/dashboard
- [ ] Sidebar navigation works
- [ ] Stats cards display
- [ ] Charts render properly
- [ ] Course browser shows courses
- [ ] Course detail page loads
- [ ] Lesson viewer plays video
- [ ] Practice questions work
- [ ] Test interface displays
- [ ] AI tutor chat loads
- [ ] Progress page shows charts
- [ ] Profile page is editable

---

## 📊 Performance Check

### Lighthouse Score Targets
Run Lighthouse audit (Chrome DevTools):

```
Performance:  90+
Accessibility: 90+
Best Practices: 90+
SEO: 90+
```

### Bundle Size
```bash
npm run build

# Check build/static/js/ for bundle sizes
# Main bundle should be < 500KB
```

---

## 🎉 Success!

If you can see the dashboard and navigate between pages, **YOU'RE READY!**

### Your Platform Is Now:
✅ **Fully functional** - All pages working
✅ **Responsive** - Works on mobile/tablet/desktop
✅ **Fast** - Optimized performance
✅ **Ready for content** - Backend integration complete
✅ **Ready to scale** - Production build available

---

## 📞 Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test

# Check for updates
npm outdated

# Update dependencies
npm update
```

---

## 🚀 YOU'RE ALL SET!

**Frontend is running, fully functional, and ready for:**
1. Content generation (Week 5-8)
2. User testing
3. Production deployment (Week 9-12)
4. Student enrollment

**Start exploring the platform at:**
http://localhost:3000/education/dashboard

**Happy Coding! 🎓💻🚀**
