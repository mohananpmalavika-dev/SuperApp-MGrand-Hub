const mongoose = require('mongoose');

/**
 * Contact Model
 * User's contact list with categories and custom fields
 */
const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contactUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Contact details
  displayName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  // Organization
  category: {
    type: String,
    enum: ['personal', 'business', 'family', 'friends', 'work', 'other'],
    default: 'personal',
    index: true,
  },
  tags: [String],
  notes: {
    type: String,
    maxlength: 500,
  },
  // Status
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true,
  },
  // Interaction tracking
  lastMessagedAt: Date,
  lastCalledAt: Date,
  messageCount: {
    type: Number,
    default: 0,
  },
  callCount: {
    type: Number,
    default: 0,
  },
  // Custom fields
  customFields: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Compound indexes
contactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });
contactSchema.index({ userId: 1, category: 1 });
contactSchema.index({ userId: 1, isFavorite: 1 });
contactSchema.index({ userId: 1, isBlocked: 1 });

// Methods
contactSchema.methods.toggleFavorite = async function() {
  this.isFavorite = !this.isFavorite;
  await this.save();
};

contactSchema.methods.block = async function() {
  this.isBlocked = true;
  await this.save();
};

contactSchema.methods.unblock = async function() {
  this.isBlocked = false;
  await this.save();
};

contactSchema.methods.updateLastMessaged = async function() {
  this.lastMessagedAt = new Date();
  this.messageCount += 1;
  await this.save();
};

contactSchema.methods.updateLastCalled = async function() {
  this.lastCalledAt = new Date();
  this.callCount += 1;
  await this.save();
};

// Static methods
contactSchema.statics.getUserContacts = async function(userId, options = {}) {
  const query = { userId, isBlocked: false };

  if (options.category) {
    query.category = options.category;
  }

  if (options.isFavorite) {
    query.isFavorite = true;
  }

  if (options.search) {
    query.$or = [
      { displayName: { $regex: options.search, $options: 'i' } },
      { phoneNumber: { $regex: options.search, $options: 'i' } },
      { email: { $regex: options.search, $options: 'i' } },
    ];
  }

  return await this.find(query)
    .populate('contactUserId', 'firstName lastName email avatar onlineStatus')
    .sort(options.sort || { lastMessagedAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

contactSchema.statics.isContactBlocked = async function(userId, contactUserId) {
  const contact = await this.findOne({ userId, contactUserId, isBlocked: true });
  return !!contact;
};

contactSchema.statics.getFavorites = async function(userId) {
  return await this.find({ userId, isFavorite: true, isBlocked: false })
    .populate('contactUserId', 'firstName lastName email avatar onlineStatus')
    .sort({ lastMessagedAt: -1 });
};

contactSchema.statics.getFrequentContacts = async function(userId, limit = 10) {
  return await this.find({ userId, isBlocked: false })
    .populate('contactUserId', 'firstName lastName email avatar onlineStatus')
    .sort({ messageCount: -1, callCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Contact', contactSchema);
