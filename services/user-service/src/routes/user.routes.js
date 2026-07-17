/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validate, Joi } = require('@mgrand-hub/shared');
const { authenticate, authorize } = require('@mgrand-hub/shared');
const multer = require('multer');

const upload = multer({ dest: 'uploads/avatars/' });

// Validation schemas
const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    displayName: Joi.string().optional(),
    bio: Joi.string().max(500).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional(),
    phone: Joi.string().optional(),
  }),
};

const addressSchema = {
  body: Joi.object({
    type: Joi.string().valid('home', 'work', 'other').optional(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    isDefault: Joi.boolean().optional(),
  }),
};

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/addresses', authenticate, validate(addressSchema), userController.addAddress);
router.put('/addresses/:addressId', authenticate, validate(addressSchema), userController.updateAddress);
router.delete('/addresses/:addressId', authenticate, userController.deleteAddress);
router.put('/preferences', authenticate, userController.updatePreferences);
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

// Admin routes
router.get('/search', authenticate, authorize('admin'), userController.searchUsers);

module.exports = router;
