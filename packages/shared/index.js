/**
 * MGrand Hub Shared Package
 * Central export for all shared utilities and configurations
 */

const logger = require('./src/logger');
const database = require('./src/database');
const redis = require('./src/redis');
const { authenticate, authorize, serviceAuth } = require('./src/middleware/auth');
const errorHandler = require('./src/middleware/errorHandler');
const validator = require('./src/middleware/validator');
const rateLimiter = require('./src/middleware/rateLimiter');
const { ApiError, ApiResponse } = require('./src/utils/apiResponse');
const { asyncHandler } = require('./src/utils/asyncHandler');
const { EventBus } = require('./src/utils/eventBus');
const { ServiceClient } = require('./src/utils/serviceClient');

module.exports = {
  // Core utilities
  logger,
  database,
  redis,
  
  // Middleware
  authenticate,
  authorize,
  serviceAuth,
  errorHandler,
  validator,
  rateLimiter,
  
  // Utilities
  ApiError,
  ApiResponse,
  asyncHandler,
  EventBus,
  ServiceClient,
};
