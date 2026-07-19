/**
 * API Debug Utility
 * Use this to verify your API endpoints are correctly configured
 * 
 * Usage in any component:
 * import { debugApiConfig } from './utils/apiDebug';
 * debugApiConfig();
 */

import config, { API_ENDPOINTS } from '../config/api.config';

export const debugApiConfig = () => {
  console.group('🔍 API Configuration Debug');
  
  console.log('📡 Service Base URLs:');
  Object.entries(config).forEach(([key, value]) => {
    if (key.includes('URL')) {
      const hasTrailingSlash = value?.endsWith('/');
      console.log(`  ${key}: ${value}`, hasTrailingSlash ? '⚠️ HAS TRAILING SLASH!' : '✓');
    }
  });
  
  console.log('\n🎯 Auth Endpoints:');
  Object.entries(API_ENDPOINTS.AUTH).forEach(([key, value]) => {
    const hasDoubleSlash = value?.includes('//api');
    console.log(`  ${key}: ${value}`, hasDoubleSlash ? '❌ DOUBLE SLASH!' : '✓');
  });
  
  console.log('\n🧪 Test URLs:');
  console.log('  Register:', API_ENDPOINTS.AUTH.REGISTER);
  console.log('  Login:', API_ENDPOINTS.AUTH.LOGIN);
  
  console.groupEnd();
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  debugApiConfig();
}

export default debugApiConfig;
