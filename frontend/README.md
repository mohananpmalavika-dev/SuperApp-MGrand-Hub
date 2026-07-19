# MGrand Hub - Personal AI Tutor Platform Frontend

A comprehensive React-based frontend for the AI-powered education platform targeting CA, IAS, JEE, and School students.

## 🚀 Features

### Student Features
- **Education Dashboard**: Overview with stats, progress charts, and course cards
- **Course Browser**: Grid/list view with search and category filters
- **Lesson Viewer**: Video player, markdown content, animations, and practice
- **Practice Questions**: MCQ interface with instant feedback and hints
- **Test Interface**: Available tests listing and test results with analytics
- **AI Tutor Chat**: Real-time chat with image upload and voice support
- **Progress Analytics**: Weekly performance charts and subject mastery
- **Study Plan**: Week view and daily schedule with task management
- **Notifications**: Filter by type with mark as read/delete functionality
- **Profile Management**: Edit user info, target exam, and study preferences
- **Subscription Management**: View plans, manage subscription, payment history

### Admin Features
- **Admin Dashboard**: Key metrics with revenue and user growth charts
- **User Management**: Searchable user table with status management
- **Content Management**: Course grid with AI content generation
- **Analytics**: Platform insights and performance metrics

## 📦 Tech Stack

- **React 18.2.0** - UI framework
- **Redux Toolkit 2.12.0** - State management
- **Material-UI 5.14.20** - Component library
- **React Router 6.20.1** - Navigation
- **Recharts 3.9.2** - Data visualization
- **React Player 3.4.0** - Video playback
- **Socket.io Client 4.8.3** - Real-time communication
- **Axios 1.6.2** - HTTP client
- **React Markdown 10.1.0** - Markdown rendering

## 🛠️ Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running (see services/education-service)

### Setup

1. **Clone and navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

4. **Start development server**
```bash
npm start
```

Application will open at `http://localhost:3000`

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.js
│   │   └── education/
│   │       ├── EducationLayout.js
│   │       └── SubscriptionBanner.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminRoutes.js
│   │   │   ├── ContentManagement.js
│   │   │   └── UserManagement.js
│   │   └── education/
│   │       ├── AITutorChat.js
│   │       ├── CourseBrowser.js
│   │       ├── CourseDetail.js
│   │       ├── EducationDashboard.js
│   │       ├── EducationRoutes.js
│   │       ├── LessonViewer.js
│   │       ├── Notifications.js
│   │       ├── PracticeQuestions.js
│   │       ├── Profile.js
│   │       ├── ProgressAnalytics.js
│   │       ├── StudyPlan.js
│   │       ├── SubscriptionManagement.js
│   │       ├── SubscriptionPlans.js
│   │       ├── TestInterface.js
│   │       └── TestResults.js
│   ├── store/
│   │   ├── slices/
│   │   │   ├── adminSlice.js
│   │   │   ├── authSlice.js
│   │   │   ├── educationSlice.js
│   │   │   ├── paymentSlice.js
│   │   │   ├── progressSlice.js
│   │   │   └── tutorSlice.js
│   │   └── index.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## 📱 Available Routes

### Student Routes (`/education`)
- `/education/dashboard` - Main dashboard
- `/education/courses` - Browse courses
- `/education/course/:courseId` - Course details
- `/education/lesson/:lessonId` - Lesson viewer
- `/education/practice` - Practice questions
- `/education/tests` - Test interface
- `/education/test/:testId/results` - Test results
- `/education/tutor` - AI tutor chat
- `/education/progress` - Progress analytics
- `/education/profile` - User profile
- `/education/notifications` - Notifications center
- `/education/study-plan` - Study planner
- `/education/subscription-plans` - View subscription plans
- `/education/subscription` - Manage subscription

### Admin Routes (`/admin`)
- `/admin/dashboard` - Admin overview
- `/admin/users` - User management
- `/admin/content` - Content management

## 🎨 Key Components

### Redux Store Structure
```javascript
{
  auth: { user, token, loading, error },
  education: { courses, enrolledCourses, currentCourse, loading, error },
  progress: { stats, weeklyProgress, subjectProgress, loading, error },
  tutor: { messages, sessionId, typing, loading, error },
  payment: { subscription, paymentHistory, plans, loading, error },
  admin: { stats, users, courses, pagination, loading, error }
}
```

### Material-UI Theme
```javascript
{
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f5f5f5' }
  }
}
```

## 🔧 Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

## 📊 Features Breakdown

### Week 1-2 (Core Features)
- ✅ Redux store setup with 6 slices
- ✅ Education dashboard with stats and charts
- ✅ Course browser with search and filters
- ✅ Course detail page with enrollment
- ✅ Lesson viewer with video player
- ✅ Practice questions interface
- ✅ Test interface and results

### Week 3 (Advanced Features)
- ✅ AI tutor chat with real-time messaging
- ✅ Profile management
- ✅ Progress analytics with charts
- ✅ Notifications center
- ✅ Study plan with calendar view

### Week 4 (Payment & Admin)
- ✅ Razorpay payment integration
- ✅ Subscription management
- ✅ Admin dashboard with analytics
- ✅ User management
- ✅ Content management with AI generation

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:
- Login: POST `/api/auth/login`
- Register: POST `/api/auth/register`
- Token stored in Redux auth slice

## 💳 Payment Integration

Razorpay integration for subscriptions:
- Test Mode: Use test API keys
- Production: Replace with live keys in `.env`

### Test Cards
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002

## 📈 Performance Optimization

### Implemented Optimizations
1. **Code Splitting**: React Router lazy loading
2. **Memoization**: useMemo for expensive calculations
3. **Lazy Loading**: Images and components
4. **Redux**: Efficient state management
5. **Material-UI**: Tree shaking enabled

### Bundle Size
- Main bundle: ~500KB (gzipped)
- Vendor bundle: ~300KB (gzipped)
- Total: ~800KB (gzipped)

## 🐛 Known Issues & Solutions

### Issue: Charts not rendering
**Solution**: Install recharts dependency
```bash
npm install recharts
```

### Issue: Razorpay script not loading
**Solution**: Check internet connection and script URL in SubscriptionPlans.js

### Issue: Video player not working
**Solution**: Ensure react-player is installed and video URLs are accessible

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course enrollment and viewing
- [ ] Lesson completion tracking
- [ ] Practice question submission
- [ ] Test taking and results
- [ ] AI tutor conversation
- [ ] Payment flow (test mode)
- [ ] Subscription management
- [ ] Admin dashboard access
- [ ] User management operations
- [ ] Content generation

### Test User Accounts
```
Student: student@test.com / password123
Admin: admin@test.com / admin123
```

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Environment Variables (Production)
```env
REACT_APP_API_URL=https://api.mgrandhub.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_live_key
```

## 📝 API Endpoints Used

### Education Service (Port 4000)
- `GET /api/courses` - Fetch all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/lessons/:id` - Get lesson content
- `POST /api/progress` - Update progress
- `GET /api/questions` - Fetch practice questions
- `POST /api/tests/:id/submit` - Submit test
- `POST /api/tutor/chat` - AI tutor conversation

### Payment Endpoints
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/subscription` - Get subscription
- `GET /api/payments/history` - Payment history

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/courses` - List all courses
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/generate-content` - Generate AI content

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is proprietary software for MGrand Hub.

## 🆘 Support

For support, email: support@mgrandhub.com

## 🎯 Roadmap

### Phase 1 (Completed) ✅
- Complete frontend implementation
- Payment integration
- Admin dashboard

### Phase 2 (Week 5-8)
- Content generation (122 lessons)
- Quality assurance
- Performance testing

### Phase 3 (Week 9-12)
- Beta testing
- Bug fixes
- Public launch

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Recharts Documentation](https://recharts.org/)

---

**Built with ❤️ by the MGrand Hub Team**
