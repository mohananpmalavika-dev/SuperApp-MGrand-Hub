/**
 * Transaction Model
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal'],
      default: 'razorpay',
    },
    gatewayOrderId: {
      type: String,
      sparse: true,
    },
    gatewayPaymentId: {
      type: String,
      sparse: true,
    },
    gatewaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'other'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorCode: String,
    errorDescription: String,
    refundedAmount: {
      type: Number,
      default: 0,
    },
    completedAt: Date,
    failedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ gatewayOrderId: 1 });
transactionSchema.index({ gatewayPaymentId: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
