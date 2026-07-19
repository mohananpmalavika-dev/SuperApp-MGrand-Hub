/**
 * Authentication and Authorization Middleware
 * Copied from shared package for deployment compatibility
 */

const jwt = require('jsonwebtoken');

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
 * Authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    next(error);
  }
};

/**
 * Authorize based on roles
 * @param {string[]} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Service-to-service authentication
 * Validates service API key
 */
const serviceAuth = (req, res, next) => {
  try {
    const serviceKey = req.headers['x-service-key'];
    
    if (!serviceKey) {
      throw new ApiError(401, 'Service key required');
    }

    if (serviceKey !== process.env.SERVICE_API_KEY) {
      throw new ApiError(401, 'Invalid service key');
    }

    req.isServiceCall = true;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    // Continue without user info
    next();
  }
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.authorize = authorize;
module.exports.serviceAuth = serviceAuth;
module.exports.optionalAuth = optionalAuth;
