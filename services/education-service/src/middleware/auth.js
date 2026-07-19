const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const isLoopbackRequest = (req) => {
  const address = req.socket?.remoteAddress || req.ip;
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1'
  );
};

const allowLocalGeneration = (req) =>
  process.env.NODE_ENV !== 'production' &&
  process.env.ALLOW_LOCAL_GENERATION === 'true' &&
  isLoopbackRequest(req);

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      if (allowLocalGeneration(req)) {
        req.user = {
          userId: 'local-content-generator',
          role: 'admin',
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

module.exports = { verifyToken, optionalAuth };
