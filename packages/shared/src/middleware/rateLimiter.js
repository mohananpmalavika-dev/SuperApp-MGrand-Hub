/**
 * Rate Limiting Middleware using Redis
 */

const redis = require('../redis');
const logger = require('../logger');
const { ApiError } = require('../utils/apiResponse');

/**
 * Rate limiter factory
 * @param {object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {function} options.keyGenerator - Function to generate unique key for client
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip, // Default to IP-based limiting
  } = options;

  return async (req, res, next) => {
    try {
      // Generate unique key for this client
      const key = `rate_limit:${keyGenerator(req)}`;
      
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current) : 0;

      // Check if limit exceeded
      if (count >= max) {
        logger.warn(`Rate limit exceeded for key: ${key}`);
        throw new ApiError(429, message);
      }

      // Increment count
      if (count === 0) {
        // First request in window, set with expiration
        await redis.set(key, 1, Math.ceil(windowMs / 1000));
      } else {
        // Increment existing count
        await redis.increment(key);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count - 1));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Rate limiter error:', error);
        // On Redis error, allow the request through
        next();
      }
    }
  };
};

/**
 * Default rate limiter (100 requests per minute per IP)
 */
const defaultRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 100,
  message: 'Too many requests, please try again later',
});

/**
 * Strict rate limiter for sensitive endpoints (10 requests per minute per IP)
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10,
  message: 'Too many requests to sensitive endpoint, please try again later',
});

/**
 * Auth rate limiter (5 login attempts per 15 minutes per IP)
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
});

/**
 * User-based rate limiter (uses userId instead of IP)
 */
const createUserRateLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => req.user?.userId || req.ip,
  });
};

module.exports = {
  createRateLimiter,
  defaultRateLimiter,
  strictRateLimiter,
  authRateLimiter,
  createUserRateLimiter,
};
