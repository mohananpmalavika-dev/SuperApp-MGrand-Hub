/**
 * OTP Model
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'phone_verification', 'password_reset', 'login'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ phone: 1, type: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
