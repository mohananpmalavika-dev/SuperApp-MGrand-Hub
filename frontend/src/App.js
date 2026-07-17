import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LaunchPage from './pages/LaunchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import NotificationsPage from './pages/NotificationsPage';
import './App.css';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
