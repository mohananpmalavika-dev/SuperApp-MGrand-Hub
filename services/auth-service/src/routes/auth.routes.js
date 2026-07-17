/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const Joi = require('joi');

// Define schemas directly (since shared package isn't loading)
const commonSchemas = {
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone must be 10 digits'),
};

// Simple validate middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = Joi.object(schema).validate(
      { body: req.body, query: req.query, params: req.params },
      { abortEarly: false, allowUnknown: true, stripUnknown: true }
    );

    if (error) {
      const errorMessage = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }

    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;
    next();
  };
};

// Get authenticate from shared (or define locally if needed)
let authenticate;
try {
  ({ authenticate } = require('@mgrand-hub/shared'));
} catch (err) {
  // Fallback: define authenticate middleware locally
  const jwt = require('jsonwebtoken');
  authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Validation schemas
const registerSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    name: Joi.string().min(2).max(100).required(),
    phone: commonSchemas.phone.optional(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required(),
  }),
};

const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const sendOTPSchema = {
  body: Joi.object({
    identifier: Joi.string().required(),
    type: Joi.string().valid('email_verification', 'phone_verification', 'password_reset', 'login').required(),
  }),
};

const verifyOTPSchema = {
  body: Joi.object({
    identifier: Joi.string().required(),
    otp: Joi.string().length(6).required(),
    type: Joi.string().valid('email_verification', 'phone_verification', 'password_reset', 'login').required(),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password.required(),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    otp: Joi.string().length(6).required(),
    newPassword: commonSchemas.password.required(),
  }),
};

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/send-otp', validate(sendOTPSchema), authController.sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-token', authController.verifyToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
