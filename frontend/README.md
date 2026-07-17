# MGrand Hub - Frontend

Modern React-based frontend for the MGrand Hub SuperApp platform.

## 🚀 Features

### ✅ Completed Pages
- **Launch Page** - Beautiful landing page with all available services
- **Login Page** - Secure authentication with JWT
- **Register Page** - User registration with validation
- **Dashboard** - Main user dashboard with service cards
- **Profile Page** - User profile management with edit capabilities
- **Payment Page** - Payment management with transaction history
- **Notifications Page** - View all notifications (Email, SMS, Push)

### 🎨 UI/UX Features
- Material-UI components
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Gradient backgrounds
- Modern card-based layouts
- Form validation
- Loading states
- Error handling

## 📦 Tech Stack

- **React 18.2** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Material-UI v5** - Component library
- **Axios** - HTTP client
- **CSS3** - Custom styling with animations

## 🛠️ Installation

```bash
# Install dependencies
npm install

# or using yarn
yarn install
```

## ⚙️ Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

## 🚀 Running the Application

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── pages/
│   │   ├── LaunchPage.js       # Landing page
│   │   ├── LoginPage.js        # Login page
│   │   ├── RegisterPage.js     # Registration page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── ProfilePage.js      # User profile
│   │   ├── PaymentPage.js      # Payments & transactions
│   │   ├── NotificationsPage.js # Notifications
│   │   └── *.css              # Page-specific styles
│   ├── App.js              # Main app component
│   ├── App.css             # Global styles
│   ├── index.js            # Entry point
│   └── index.css           # Base styles
├── .env                    # Environment variables
├── package.json            # Dependencies
└── README.md              # This file
```

## 🔐 Authentication

The app uses JWT token-based authentication:
- Tokens stored in localStorage
- Automatic redirect to login for protected routes
- Logout functionality with token cleanup

## 🎯 Available Routes

| Route | Page | Protected | Description |
|-------|------|-----------|-------------|
| `/` | Launch Page | No | Landing page with all services |
| `/login` | Login | No | User login |
| `/register` | Register | No | New user registration |
| `/dashboard` | Dashboard | Yes | Main user dashboard |
| `/profile` | Profile | Yes | User profile management |
| `/payments` | Payments | Yes | Payment transactions |
| `/notifications` | Notifications | Yes | Notification center |

## 🎨 Modules Status

### Active Services (4)
✅ **Payments** - View transactions, make payments
✅ **Profile** - Manage user profile
✅ **Notifications** - Email, SMS, Push notifications
✅ **Dashboard** - Overview of all services

### Coming Soon (6)
⏳ E-Commerce
⏳ Food Delivery
⏳ Classifieds
⏳ Business Hub
⏳ Social Network
⏳ AI Services
⏳ Finance Services

## 🔧 Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080
```

## 📱 Pages Overview

### 1. Launch Page
- Hero section with branding
- Service cards with status badges
- Login/Register buttons
- Responsive grid layout

### 2. Login/Register
- Form validation
- Password visibility toggle
- Error/success messages
- Smooth animations

### 3. Dashboard
- User welcome message
- Quick stats cards
- Service navigation
- Top navigation bar

### 4. Profile Page
- View/Edit profile information
- Upload avatar
- Address management
- Account statistics

### 5. Payment Page
- Transaction history
- Payment creation
- Status filters
- Invoice management (coming soon)

### 6. Notifications Page
- Filter by type (Email, SMS, Push)
- Status indicators
- Notification history
- Test notification buttons

## 🌐 API Integration

All API calls go through the API Gateway (`http://localhost:8080`):

```javascript
// Example API call
const response = await axios.get(`${API_URL}/api/users/profile`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 🎨 Color Scheme

```css
Primary: #667eea (Purple)
Secondary: #764ba2 (Dark Purple)
Success: #4ECDC4 (Teal)
Warning: #FFA07A (Orange)
Error: #F38181 (Red)
Info: #95E1D3 (Light Teal)
```

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Development Guidelines

1. **Component Structure**
   - Use functional components with hooks
   - Keep components focused and reusable
   - Use Material-UI components

2. **State Management**
   - useState for local state
   - localStorage for persistence
   - Props for parent-child communication

3. **Styling**
   - Material-UI sx prop for inline styles
   - CSS files for page-specific styles
   - Consistent color scheme

4. **API Calls**
   - Use axios with async/await
   - Handle errors gracefully
   - Show loading states

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port
set PORT=3001 && npm start
```

### CORS Issues
Make sure API Gateway allows CORS from `http://localhost:3000`

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Future Enhancements

- [ ] State management with Redux/Context
- [ ] Real-time notifications with WebSockets
- [ ] Progressive Web App (PWA) features
- [ ] Internationalization (i18n)
- [ ] Dark mode theme
- [ ] Advanced search and filters
- [ ] File upload with preview
- [ ] Chat interface
- [ ] Analytics dashboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

MGrand Hub Development Team

## 🙏 Acknowledgments

- Material-UI for the component library
- React team for the amazing framework
- All contributors to this project
