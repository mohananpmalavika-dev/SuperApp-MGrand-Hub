/**
 * API Configuration
 * Centralized API endpoint configuration for all microservices
 */

// Helper function to remove trailing slashes from URLs
const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, ''); // Remove one or more trailing slashes
};

const config = {
  // Main API URL (auth service)
  API_URL: normalizeUrl(process.env.REACT_APP_API_URL) || 'http://localhost:8080',
  
  // Individual service URLs
  AUTH_SERVICE_URL: normalizeUrl(process.env.REACT_APP_AUTH_SERVICE_URL || process.env.REACT_APP_API_URL) || 'http://localhost:3001',
  USER_SERVICE_URL: normalizeUrl(process.env.REACT_APP_USER_SERVICE_URL) || 'http://localhost:3002',
  ECOMMERCE_SERVICE_URL: normalizeUrl(process.env.REACT_APP_ECOMMERCE_SERVICE_URL) || 'http://localhost:3003',
  PAYMENT_SERVICE_URL: normalizeUrl(process.env.REACT_APP_PAYMENT_SERVICE_URL) || 'http://localhost:3004',
  CLASSIFIEDS_SERVICE_URL: normalizeUrl(process.env.REACT_APP_CLASSIFIEDS_SERVICE_URL) || 'http://localhost:3005',
  FOOD_SERVICE_URL: normalizeUrl(process.env.REACT_APP_FOOD_SERVICE_URL) || 'http://localhost:3006',
  NOTIFICATION_SERVICE_URL: normalizeUrl(process.env.REACT_APP_NOTIFICATION_SERVICE_URL) || 'http://localhost:3012',
  TUTOR_SERVICE_URL: normalizeUrl(process.env.REACT_APP_TUTOR_SERVICE_URL) || 'http://localhost:3013',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
};

// API Endpoints by service
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${config.AUTH_SERVICE_URL}/api/auth/login`,
    REGISTER: `${config.AUTH_SERVICE_URL}/api/auth/register`,
    LOGOUT: `${config.AUTH_SERVICE_URL}/api/auth/logout`,
    REFRESH: `${config.AUTH_SERVICE_URL}/api/auth/refresh`,
    PROFILE: `${config.AUTH_SERVICE_URL}/api/auth/profile`,
  },
  
  // User endpoints
  USER: {
    BASE: `${config.USER_SERVICE_URL}/api/users`,
    PROFILE: (userId) => `${config.USER_SERVICE_URL}/api/users/${userId}`,
  },
  
  // Tutor endpoints
  TUTOR: {
    BASE: `${config.TUTOR_SERVICE_URL}/api/tutor`,
    SESSIONS: {
      START: `${config.TUTOR_SERVICE_URL}/api/tutor/sessions/start`,
      GET: (sessionId) => `${config.TUTOR_SERVICE_URL}/api/tutor/sessions/${sessionId}`,
      PROGRESS: (sessionId) => `${config.TUTOR_SERVICE_URL}/api/tutor/sessions/${sessionId}/progress`,
      COMPLETE: (sessionId) => `${config.TUTOR_SERVICE_URL}/api/tutor/sessions/${sessionId}/complete`,
    },
    VOICE: {
      PREFERENCES: `${config.TUTOR_SERVICE_URL}/api/tutor/voice/preferences`,
      SPEECH: `${config.TUTOR_SERVICE_URL}/api/tutor/voice/speech`,
      SPEECH_LESSON: `${config.TUTOR_SERVICE_URL}/api/tutor/voice/speech/lesson`,
      VOICES: `${config.TUTOR_SERVICE_URL}/api/tutor/voice/voices`,
    },
    ANALYTICS: {
      DASHBOARD: `${config.TUTOR_SERVICE_URL}/api/tutor/analytics/dashboard`,
    },
  },
  
  // Ecommerce endpoints
  ECOMMERCE: {
    BASE: `${config.ECOMMERCE_SERVICE_URL}/api/ecommerce`,
    PRODUCTS: `${config.ECOMMERCE_SERVICE_URL}/api/ecommerce/products`,
    ORDERS: `${config.ECOMMERCE_SERVICE_URL}/api/ecommerce/orders`,
  },
  
  // Payment endpoints
  PAYMENT: {
    BASE: `${config.PAYMENT_SERVICE_URL}/api/payments`,
    CREATE_ORDER: `${config.PAYMENT_SERVICE_URL}/api/payments/create-order`,
    VERIFY: `${config.PAYMENT_SERVICE_URL}/api/payments/verify`,
  },
};

export default config;
