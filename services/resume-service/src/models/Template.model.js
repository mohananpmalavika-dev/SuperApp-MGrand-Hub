const mongoose = require('mongoose');

/**
 * Template Model
 * Stores resume template configurations
 */
const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'academic', 'technical', 'executive'],
    default: 'professional',
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  preview: {
    type: String,
    trim: true,
  },
  // Template Configuration
  config: {
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'three-column'],
      default: 'single-column',
    },
    sectionOrder: [String],
    headerStyle: {
      type: String,
      enum: ['centered', 'left', 'right', 'split'],
      default: 'centered',
    },
    showPhoto: {
      type: Boolean,
      default: false,
    },
    showIcons: {
      type: Boolean,
      default: true,
    },
    colorScheme: {
      primary: String,
      secondary: String,
      accent: String,
      text: String,
      background: String,
    },
    typography: {
      headingFont: String,
      bodyFont: String,
      headingSize: Number,
      bodySize: Number,
    },
  },
  // Features
  features: {
    atsOptimized: { type: Boolean, default: true },
    customizable: { type: Boolean, default: true },
    printFriendly: { type: Boolean, default: true },
    responsive: { type: Boolean, default: true },
  },
  // Metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  tags: [String],
}, {
  timestamps: true,
});

// Indexes
templateSchema.index({ name: 1 });
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ isPremium: 1 });

// Method to increment usage count
templateSchema.methods.recordUsage = function () {
  this.usageCount += 1;
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);
