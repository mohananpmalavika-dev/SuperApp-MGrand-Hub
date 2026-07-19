import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import LaunchPage from './pages/LaunchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import NotificationsPage from './pages/NotificationsPage';
import TutorDashboard from './pages/TutorDashboard';
import NewSessionPage from './pages/NewSessionPage';
import LessonView from './pages/LessonView';
import ResumeDashboard from './pages/resume/ResumeDashboard';
import MessagingDashboard from './pages/messaging/MessagingDashboard';
import EducationRoutes from './pages/education/EducationRoutes';
import EducationLayout from './components/education/EducationLayout';
import CAFoundationCourses from './pages/education/CAFoundationCourses';
import CAFoundationCourse from './pages/education/CAFoundationCourse';
import CAFoundationLesson from './pages/education/CAFoundationLesson';
import AdminRoutes from './pages/admin/AdminRoutes';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LaunchPage user={user} />} />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={login} />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={login} />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/profile" 
                element={user ? <ProfilePage user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/payments" 
                element={user ? <PaymentPage user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/notifications" 
                element={user ? <NotificationsPage user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/tutor/dashboard" 
                element={user ? <TutorDashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/tutor/session/new" 
                element={user ? <NewSessionPage user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/tutor/session/:sessionId" 
                element={user ? <LessonView user={user} /> : <Navigate to="/login" />} 
              />
              
              {/* Resume Builder Routes */}
              <Route 
                path="/resume" 
                element={user ? <ResumeDashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              
              {/* Messaging Routes */}
              <Route 
                path="/messaging" 
                element={user ? <MessagingDashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
              />
              
              {/* Education Routes */}
              <Route
                path="/education/ca-foundation"
                element={<EducationLayout><CAFoundationCourses /></EducationLayout>}
              />
              <Route
                path="/education/ca-foundation/:courseId"
                element={<EducationLayout><CAFoundationCourse /></EducationLayout>}
              />
              <Route
                path="/education/ca-foundation/:courseId/lesson/:lessonIndex"
                element={<EducationLayout><CAFoundationLesson /></EducationLayout>}
              />
              <Route 
                path="/education/*" 
                element={user ? <EducationRoutes /> : <Navigate to="/login" />} 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={user ? <AdminRoutes /> : <Navigate to="/login" />} 
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
