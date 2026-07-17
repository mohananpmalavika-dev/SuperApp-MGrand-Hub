/**
 * API Response Utilities
 */

/**
 * Custom API Error class
 */
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

/**
 * API Response class
 */
class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    
    if (data !== null) {
      this.data = data;
    }
  }
}

module.exports = {
  ApiError,
  ApiResponse,
};
