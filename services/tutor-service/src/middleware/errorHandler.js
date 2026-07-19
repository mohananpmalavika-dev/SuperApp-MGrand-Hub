/**
 * Error Handler Middleware
 * Centralized error handling
 */

const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 if no status code
  statusCode = statusCode || 500;
  message = message || 'Internal Server Error';

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.originalUrl,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, ApiError };
