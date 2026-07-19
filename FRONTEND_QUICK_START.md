# 🚀 Frontend Quick Start Guide

## ⚡ 5-Minute Setup

### **Step 1: Install Dependencies**
```bash
cd frontend
npm install
```

### **Step 2: Configure Environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

### **Step 3: Start Development Server**
```bash
npm start
```

✅ **Done!** App running at `http://localhost:3000`

---

## 📱 Available Pages

### **Student Portal** (`/education`)
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/education/dashboard` | Main dashboard with stats |
| Courses | `/education/courses` | Browse all courses |
| Course Detail | `/education/course/:id` | View course details |
| Lesson | `/education/lesson/:id` | Watch lessons |
| Practice | `/education/practice` | Practice questions |
| Tests | `/education/tests` | Take tests |
| Results | `/education/test/:id/results` | View results |
| AI Tutor | `/education/tutor` | Chat with AI |
| Progress | `/education/progress` | Analytics |
| Profile | `/education/profile` | Edit profile |
| Notifications | `/education/notifications` | View notifications |
| Study Plan | `/education/study-plan` | Plan your study |
| Plans | `/education/subscription-plans` | View pricing |
| Subscription | `/education/subscription` | Manage subscription |

### **Admin Portal** (`/admin`)
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin/dashboard` | Admin overview |
| Users | `/admin/users` | Manage users |
| Content | `/admin/content` | Manage courses |

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18.2.0 |
| State | Redux Toolkit 2.12.0 |
| UI Library | Material-UI 5.14.20 |
| Routing | React Router 6.20.1 |
| Charts | Recharts 3.9.2 |
| Video | React Player 3.4.0 |
| Real-time | Socket.io Client 4.8.3 |
| HTTP | Axios 1.6.2 |

---

## 🔑 Key Features

### ✅ **For Students**
- Browse 4 tracks (CA/IAS/JEE/School)
- Watch video lessons
- Practice MCQs
- Take tests
- Chat with AI tutor 24/7
- Track progress
- Plan study schedule
- Subscribe to plans

### ✅ **For Admins**
- View analytics
- Manage users
- Generate AI content
- Track revenue

---

## 💳 Pricing

| Plan | Price | Duration |
|------|-------|----------|
| Monthly | ₹999 | 1 Month |
| Quarterly | ₹2,499 | 3 Months |
| Annual | ₹7,999 | 12 Months |

---

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── store/         # Redux store
│   ├── App.js         # Main app
│   └── index.js       # Entry point
├── public/            # Static files
├── .env              # Environment vars
└── package.json      # Dependencies
```

---

## 🐛 Troubleshooting

### **Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm start
```

### **Dependencies not installing**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Razorpay not loading**
Check internet connection and API key in `.env`

### **Charts not showing**
```bash
npm install recharts
```

---

## 📚 Documentation

- **Full Guide**: `frontend/README.md`
- **Complete Summary**: `FRONTEND_IMPLEMENTATION_COMPLETE.md`
- **Week 4 Details**: `WEEK_4_FRONTEND_COMPLETE.md`

---

## 🎯 Next Steps

1. ✅ Frontend Complete
2. **Generate Content** (Week 5-8) ← Start Here
   - Run: `node scripts/generate-ca-foundation.js`
3. Beta Testing (Week 9-10)
4. Public Launch (Week 11-12)

---

## 🆘 Need Help?

- 📖 Read: `frontend/README.md`
- 🔍 Check: `FRONTEND_IMPLEMENTATION_COMPLETE.md`
- 📝 Review: `WEEK_5-8_CONTENT_GENERATION_PLAN.md`

---

**🚀 Happy Coding! Frontend is 100% Ready!** 🚀
