/**
 * User Profile Model
 */

const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    firstName: String,
    lastName: String,
    displayName: String,
    avatar: String,
    bio: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    phone: String,
    alternateEmail: String,
    addresses: [{
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
      },
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      isDefault: Boolean,
    }],
    preferences: {
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'INR' },
      timezone: String,
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
    social: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    metadata: mongoose.Schema.Types.Mixed,
    isProfileComplete: { type: Boolean, default: false },
    lastUpdated: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ phone: 1 }, { sparse: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
