/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { validate } = require('@mgrand-hub/shared');
const { authenticate, authorize } = require('@mgrand-hub/shared');
const Joi = require('joi');

// Validation schemas
const sendEmailSchema = {
  body: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
    templateId: Joi.string().optional(),
    templateData: Joi.object().optional(),
  }),
};

const sendSMSSchema = {
  body: Joi.object({
    to: Joi.string().required(),
    content: Joi.string().max(160).required(),
  }),
};

const sendPushSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    data: Joi.object().optional(),
  }),
};

const templateSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('email', 'sms', 'push').required(),
    subject: Joi.string().optional(),
    content: Joi.string().required(),
    variables: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional(),
  }),
};

// Protected routes
router.post('/email', authenticate, validate(sendEmailSchema), notificationController.sendEmail);
router.post('/sms', authenticate, validate(sendSMSSchema), notificationController.sendSMS);
router.post('/push', authenticate, validate(sendPushSchema), notificationController.sendPush);
router.get('/list', authenticate, notificationController.getUserNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Admin routes
router.post('/templates', authenticate, authorize('admin'), validate(templateSchema), notificationController.saveTemplate);
router.get('/templates', authenticate, notificationController.getTemplates);

module.exports = router;
