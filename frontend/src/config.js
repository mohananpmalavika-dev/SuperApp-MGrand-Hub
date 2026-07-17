// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  
  // User
  USER_PROFILE: '/api/users/profile',
  USER_ADDRESSES: '/api/users/addresses',
  
  // Payment
  PAYMENTS: '/api/payments/orders',
  TRANSACTIONS: '/api/payments/transactions',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications/list',
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
