// API Configuration - Production Ready
const normalizeUrl = (url) => url?.replace(/\/+$/, '');

const API_SERVICES = {
  auth: normalizeUrl(process.env.REACT_APP_AUTH_SERVICE_URL) || 'http://localhost:3001',
  user: normalizeUrl(process.env.REACT_APP_USER_SERVICE_URL) || 'http://localhost:3002',
  ecommerce: normalizeUrl(process.env.REACT_APP_ECOMMERCE_SERVICE_URL) || 'http://localhost:3003',
  payment: normalizeUrl(process.env.REACT_APP_PAYMENT_SERVICE_URL) || 'http://localhost:3004',
  classifieds: normalizeUrl(process.env.REACT_APP_CLASSIFIEDS_SERVICE_URL) || 'http://localhost:3005',
  food: normalizeUrl(process.env.REACT_APP_FOOD_SERVICE_URL) || 'http://localhost:3006',
  notification: normalizeUrl(process.env.REACT_APP_NOTIFICATION_SERVICE_URL) || 'http://localhost:3012',
};

// Legacy support - use auth service as main API
export const API_URL = process.env.REACT_APP_API_URL || API_SERVICES.auth;

// API Endpoints with dynamic service URLs
export const API_ENDPOINTS = {
  // Auth Service
  LOGIN: `${API_SERVICES.auth}/api/auth/login`,
  REGISTER: `${API_SERVICES.auth}/api/auth/register`,
  LOGOUT: `${API_SERVICES.auth}/api/auth/logout`,
  PROFILE: `${API_SERVICES.auth}/api/auth/profile`,
  VERIFY_OTP: `${API_SERVICES.auth}/api/auth/verify-otp`,
  REFRESH_TOKEN: `${API_SERVICES.auth}/api/auth/refresh`,
  
  // User Service
  USER_PROFILE: `${API_SERVICES.user}/api/users/profile`,
  USER_ADDRESSES: `${API_SERVICES.user}/api/users/addresses`,
  USER_PREFERENCES: `${API_SERVICES.user}/api/users/preferences`,
  
  // Ecommerce Service
  PRODUCTS: `${API_SERVICES.ecommerce}/api/products`,
  CART: `${API_SERVICES.ecommerce}/api/cart`,
  ORDERS: `${API_SERVICES.ecommerce}/api/orders`,
  
  // Payment Service
  PAYMENTS: `${API_SERVICES.payment}/api/payments/orders`,
  TRANSACTIONS: `${API_SERVICES.payment}/api/payments/transactions`,
  VERIFY_PAYMENT: `${API_SERVICES.payment}/api/payments/verify`,
  
  // Classifieds Service
  CLASSIFIEDS: `${API_SERVICES.classifieds}/api/classifieds`,
  
  // Food Service
  RESTAURANTS: `${API_SERVICES.food}/api/restaurants`,
  FOOD_ORDERS: `${API_SERVICES.food}/api/orders`,
  
  // Notification Service
  NOTIFICATIONS: `${API_SERVICES.notification}/api/notifications/list`,
  MARK_READ: `${API_SERVICES.notification}/api/notifications/mark-read`,
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

// Environment info
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log configuration in development
if (isDevelopment) {
  console.log('🚀 API Configuration:', {
    environment: process.env.NODE_ENV,
    services: API_SERVICES
  });
}
