/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { validate, commonSchemas, Joi } = require('@mgrand-hub/shared');
const { authenticate, authorize } = require('@mgrand-hub/shared');

// Validation schemas
const createOrderSchema = {
  body: Joi.object({
    amount: Joi.number().min(1).required(),
    currency: Joi.string().uppercase().default('INR'),
    orderId: Joi.string().required(),
    metadata: Joi.object().optional(),
  }),
};

const verifyPaymentSchema = {
  body: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

const refundSchema = {
  body: Joi.object({
    amount: Joi.number().min(1).required(),
    reason: Joi.string().required(),
  }),
};

// Protected routes (require authentication)
router.post(
  '/orders',
  authenticate,
  validate(createOrderSchema),
  paymentController.createOrder
);

router.post(
  '/verify',
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.get(
  '/transactions/:id',
  authenticate,
  paymentController.getTransaction
);

router.get(
  '/transactions',
  authenticate,
  paymentController.getUserTransactions
);

router.post(
  '/refunds/:id',
  authenticate,
  authorize('admin'), // Only admins can process refunds
  validate(refundSchema),
  paymentController.processRefund
);

router.get(
  '/statistics',
  authenticate,
  paymentController.getStatistics
);

// Public routes
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
