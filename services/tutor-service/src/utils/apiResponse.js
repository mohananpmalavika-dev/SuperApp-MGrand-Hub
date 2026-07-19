/**
 * API Response Utilities
 * Copied from shared package for deployment compatibility
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

/**
 * Helper functions for common responses
 */
const apiResponse = {
  success: (data = null, message = 'Success') => {
    return new ApiResponse(200, data, message);
  },
  
  created: (data = null, message = 'Created successfully') => {
    return new ApiResponse(201, data, message);
  },
  
  error: (message = 'An error occurred', statusCode = 500) => {
    return {
      success: false,
      statusCode,
      message,
      data: null
    };
  },
  
  notFound: (message = 'Resource not found') => {
    return {
      success: false,
      statusCode: 404,
      message,
      data: null
    };
  },
  
  unauthorized: (message = 'Unauthorized') => {
    return {
      success: false,
      statusCode: 401,
      message,
      data: null
    };
  },
  
  forbidden: (message = 'Forbidden') => {
    return {
      success: false,
      statusCode: 403,
      message,
      data: null
    };
  },
  
  badRequest: (message = 'Bad request') => {
    return {
      success: false,
      statusCode: 400,
      message,
      data: null
    };
  }
};

module.exports = {
  ApiError,
  ApiResponse,
  apiResponse
};
