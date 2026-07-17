/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors
 */

/**
 * Async handler wrapper
 * @param {function} fn - Async function to wrap
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  asyncHandler,
};
