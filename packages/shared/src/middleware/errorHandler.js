/**
 * Global Error Handler Middleware
 */

const logger = require('../logger');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error
  const logMessage = `${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;
  
  if (error.statusCode >= 500) {
    logger.error(logMessage, {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId,
    });
  } else {
    logger.warn(logMessage);
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Handle unhandled promise rejections
 */
const unhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log
  });
};

/**
 * Handle uncaught exceptions
 */
const uncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Exit the process
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFound,
  unhandledRejection,
  uncaughtException,
};
