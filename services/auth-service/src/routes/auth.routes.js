/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, commonSchemas, Joi } = require('@mgrand-hub/shared');
const { authenticate } = require('@mgrand-hub/shared');

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
