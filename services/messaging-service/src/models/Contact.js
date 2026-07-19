const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked', 'rejected'],
    default: 'pending',
    index: true
  },
  nickname: {
    type: String,
    trim: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: Date,
  blockedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique contact pairs
contactSchema.index({ user: 1, contact: 1 }, { unique: true });

// Index for efficient queries
contactSchema.index({ user: 1, status: 1 });
contactSchema.index({ contact: 1, status: 1 });

module.exports = mongoose.model('Contact', contactSchema);
