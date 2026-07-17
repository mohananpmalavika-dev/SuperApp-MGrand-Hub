/**
 * Notification Model
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in-app'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['sendgrid', 'smtp', 'twilio', 'firebase', 'internal'],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: String,
    content: {
      type: String,
      required: true,
    },
    templateId: String,
    templateData: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    metadata: mongoose.Schema.Types.Mixed,
    errorMessage: String,
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
