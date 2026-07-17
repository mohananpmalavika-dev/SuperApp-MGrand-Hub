/**
 * Refund Model
 */

const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
    reason: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal'],
      required: true,
    },
    gatewayRefundId: {
      type: String,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errorCode: String,
    errorDescription: String,
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
refundSchema.index({ transactionId: 1, status: 1 });
refundSchema.index({ gatewayRefundId: 1 });

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;
