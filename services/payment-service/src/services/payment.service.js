/**
 * Payment Service - Core Business Logic
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction.model');
const Invoice = require('../models/Invoice.model');
const Refund = require('../models/Refund.model');
const { logger, redis, ApiError, EventBus } = require('@mgrand-hub/shared');

class PaymentService {
  constructor() {
    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create payment order
   */
  async createOrder(userId, orderData) {
    try {
      const { amount, currency = 'INR', orderId, metadata } = orderData;

      // Validate amount
      if (!amount || amount <= 0) {
        throw new ApiError(400, 'Invalid amount');
      }

      // Create Razorpay order
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: orderId,
        notes: metadata || {},
      });

      // Create transaction record
      const transaction = await Transaction.create({
        userId,
        orderId,
        amount,
        currency,
        gateway: 'razorpay',
        gatewayOrderId: razorpayOrder.id,
        status: 'pending',
        metadata,
      });

      logger.info('Payment order created', {
        userId,
        transactionId: transaction._id,
        orderId,
        amount,
      });

      // Publish event
      await EventBus.publish('payment.order.created', {
        userId,
        transactionId: transaction._id,
        orderId,
        amount,
      });

      return {
        transaction,
        razorpayOrder,
      };
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentData) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = paymentData;

      // Find transaction
      const transaction = await Transaction.findOne({
        gatewayOrderId: razorpay_order_id,
      });

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      // Verify signature
      const isValid = this.verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        transaction.status = 'failed';
        transaction.errorDescription = 'Invalid signature';
        transaction.failedAt = new Date();
        await transaction.save();

        throw new ApiError(400, 'Invalid payment signature');
      }

      // Update transaction
      transaction.status = 'completed';
      transaction.gatewayPaymentId = razorpay_payment_id;
      transaction.gatewaySignature = razorpay_signature;
      transaction.completedAt = new Date();
      await transaction.save();

      logger.info('Payment verified successfully', {
        transactionId: transaction._id,
        paymentId: razorpay_payment_id,
      });

      // Publish success event
      await EventBus.publish('payment.completed', {
        userId: transaction.userId,
        transactionId: transaction._id,
        orderId: transaction.orderId,
        amount: transaction.amount,
      });

      // Generate invoice
      await this.generateInvoice(transaction._id);

      return transaction;
    } catch (error) {
      logger.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Verify Razorpay signature
   */
  verifyRazorpaySignature(orderId, paymentId, signature) {
    const text = `${orderId}|${paymentId}`;
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated === signature;
  }

  /**
   * Get transaction
   */
  async getTransaction(transactionId, userId = null) {
    try {
      const query = { _id: transactionId };
      if (userId) query.userId = userId;

      const transaction = await Transaction.findOne(query);

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      return transaction;
    } catch (error) {
      logger.error('Get transaction error:', error);
      throw error;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId, filters = {}) {
    try {
      const { status, page = 1, limit = 10 } = filters;

      const query = { userId };
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get user transactions error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      const invoice = await Invoice.create({
        userId: transaction.userId,
        transactionId: transaction._id,
        amount: transaction.amount,
        totalAmount: transaction.amount,
        currency: transaction.currency,
        status: 'paid',
        paidAt: transaction.completedAt,
      });

      logger.info('Invoice generated', {
        invoiceId: invoice._id,
        transactionId,
      });

      return invoice;
    } catch (error) {
      logger.error('Generate invoice error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, refundData) {
    try {
      const { amount, reason } = refundData;

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new ApiError(400, 'Can only refund completed transactions');
      }

      const refundableAmount = transaction.amount - transaction.refundedAmount;

      if (amount > refundableAmount) {
        throw new ApiError(400, 'Refund amount exceeds available amount');
      }

      // Create refund with Razorpay
      const razorpayRefund = await this.razorpay.payments.refund(
        transaction.gatewayPaymentId,
        {
          amount: amount * 100, // Convert to paise
          notes: { reason },
        }
      );

      // Create refund record
      const refund = await Refund.create({
        transactionId: transaction._id,
        userId: transaction.userId,
        amount,
        currency: transaction.currency,
        reason,
        gateway: transaction.gateway,
        gatewayRefundId: razorpayRefund.id,
        status: 'completed',
        processedAt: new Date(),
      });

      // Update transaction
      transaction.refundedAmount += amount;
      if (transaction.refundedAmount >= transaction.amount) {
        transaction.status = 'refunded';
      }
      await transaction.save();

      logger.info('Refund processed', {
        refundId: refund._id,
        transactionId,
        amount,
      });

      // Publish event
      await EventBus.publish('payment.refunded', {
        userId: transaction.userId,
        transactionId: transaction._id,
        refundId: refund._id,
        amount,
      });

      return refund;
    } catch (error) {
      logger.error('Process refund error:', error);
      throw error;
    }
  }

  /**
   * Handle webhook
   */
  async handleWebhook(event) {
    try {
      logger.info('Webhook received', { event: event.event });

      switch (event.event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event.payload.payment.entity);
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(event.payload.refund.entity);
          break;

        default:
          logger.warn('Unhandled webhook event', { event: event.event });
      }

      return true;
    } catch (error) {
      logger.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle payment captured
   */
  async handlePaymentCaptured(payment) {
    const transaction = await Transaction.findOne({
      gatewayOrderId: payment.order_id,
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.gatewayPaymentId = payment.id;
      transaction.paymentMethod = payment.method;
      transaction.completedAt = new Date();
      await transaction.save();

      await EventBus.publish('payment.completed', {
        userId: transaction.userId,
        transactionId: transaction._id,
        orderId: transaction.orderId,
        amount: transaction.amount,
      });
    }
  }

  /**
   * Handle payment failed
   */
  async handlePaymentFailed(payment) {
    const transaction = await Transaction.findOne({
      gatewayOrderId: payment.order_id,
    });

    if (transaction) {
      transaction.status = 'failed';
      transaction.errorCode = payment.error_code;
      transaction.errorDescription = payment.error_description;
      transaction.failedAt = new Date();
      await transaction.save();

      await EventBus.publish('payment.failed', {
        userId: transaction.userId,
        transactionId: transaction._id,
        orderId: transaction.orderId,
      });
    }
  }

  /**
   * Handle refund processed
   */
  async handleRefundProcessed(refund) {
    await Refund.updateOne(
      { gatewayRefundId: refund.id },
      {
        status: 'completed',
        processedAt: new Date(),
      }
    );
  }
}

module.exports = new PaymentService();
