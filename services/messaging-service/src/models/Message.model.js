const mongoose = require('mongoose');

/**
 * Message Model
 * Supports text, media, polls, scheduled messages, and more
 */
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Message content
  content: {
    type: String,
    maxlength: 10000,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'poll', 'system'],
    default: 'text',
    index: true,
  },
  // Client-side unique ID for deduplication
  clientMessageId: {
    type: String,
    trim: true,
  },
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file'],
    },
    url: String,
    thumbnailUrl: String,
    filename: String,
    size: Number,
    mimeType: String,
    duration: Number, // for audio/video
    dimensions: {
      width: Number,
      height: Number,
    },
  }],
  // Location data
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    placeName: String,
  },
  // Contact data
  contact: {
    name: String,
    phoneNumbers: [String],
    emails: [String],
  },
  // Poll data
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        userId: mongoose.Schema.Types.ObjectId,
        votedAt: Date,
      }],
    }],
    allowMultipleAnswers: { type: Boolean, default: false },
    expiresAt: Date,
  },
  // Reply/Thread
  replyTo: {
    messageId: mongoose.Schema.Types.ObjectId,
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  // Forward from
  forwardedFrom: {
    chatId: mongoose.Schema.Types.ObjectId,
    messageId: mongoose.Schema.Types.ObjectId,
    originalSender: mongoose.Schema.Types.ObjectId,
  },
  // Encryption
  encrypted: {
    type: Boolean,
    default: false,
  },
  encryptionKeyId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  // Status
  deliveryStatus: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sending',
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: Date,
  }],
  deliveredTo: [{
    userId: mongoose.Schema.Types.ObjectId,
    deliveredAt: Date,
  }],
  // Reactions
  reactions: [{
    userId: mongoose.Schema.Types.ObjectId,
    emoji: String,
    reactedAt: { type: Date, default: Date.now },
  }],
  // Edit history
  isEdited: {
    type: Boolean,
    default: false,
  },
  edits: [{
    content: String,
    editedAt: Date,
  }],
  editedAt: Date,
  // Deletion
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: mongoose.Schema.Types.ObjectId,
  deletedFor: [{
    userId: mongoose.Schema.Types.ObjectId,
    deletedAt: Date,
  }],
  // Scheduled message
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false,
  },
  // AI features
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  translated: {
    original: {
      language: String,
      content: String,
    },
    translations: [{
      language: String,
      content: String,
      translatedAt: Date,
    }],
  },
  // Mentions
  mentions: [{
    userId: mongoose.Schema.Types.ObjectId,
    startIndex: Number,
    length: Number,
  }],
  // Pinned
  isPinned: {
    type: Boolean,
    default: false,
  },
  pinnedAt: Date,
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, senderId: 1 });
messageSchema.index({ chatId: 1, deliveryStatus: 1 });
messageSchema.index({ scheduledFor: 1, isScheduled: 1 });
messageSchema.index({ clientMessageId: 1, chatId: 1 });
messageSchema.index({ threadId: 1 });

// Methods
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(r => r.userId.equals(userId))) {
    this.readBy.push({ userId, readAt: new Date() });
    this.deliveryStatus = 'read';
    await this.save();
  }
};

messageSchema.methods.markAsDelivered = async function(userId) {
  if (!this.deliveredTo.some(d => d.userId.equals(userId))) {
    this.deliveredTo.push({ userId, deliveredAt: new Date() });
    if (this.deliveryStatus === 'sent') {
      this.deliveryStatus = 'delivered';
    }
    await this.save();
  }
};

messageSchema.methods.addReaction = async function(userId, emoji) {
  const existing = this.reactions.find(r => r.userId.equals(userId) && r.emoji === emoji);
  if (!existing) {
    this.reactions.push({ userId, emoji, reactedAt: new Date() });
    await this.save();
  }
};

messageSchema.methods.removeReaction = async function(userId, emoji) {
  this.reactions = this.reactions.filter(r => !(r.userId.equals(userId) && r.emoji === emoji));
  await this.save();
};

messageSchema.methods.editContent = async function(newContent) {
  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() - this.createdAt.getTime() > fiveMinutes) {
    throw new Error('Message can only be edited within 5 minutes');
  }

  this.edits.push({
    content: this.content,
    editedAt: new Date(),
  });
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
};

messageSchema.methods.softDelete = async function(userId) {
  this.deletedFor.push({ userId, deletedAt: new Date() });
  await this.save();
};

messageSchema.methods.hardDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[Deleted]';
  this.media = [];
  await this.save();
};

// Static methods
messageSchema.statics.getChatMessages = async function(chatId, options = {}) {
  const query = {
    chatId,
    isDeleted: false,
    $or: [
      { isScheduled: false },
      { isScheduled: true, scheduledFor: { $lte: new Date() } },
    ],
  };

  if (options.before) {
    query.createdAt = { $lt: options.before };
  }

  return await this.find(query)
    .populate('senderId', 'firstName lastName email avatar')
    .populate('replyTo.senderId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

messageSchema.statics.getUnreadCount = async function(chatId, userId) {
  return await this.countDocuments({
    chatId,
    senderId: { $ne: userId },
    readBy: { $not: { $elemMatch: { userId } } },
    isDeleted: false,
  });
};

messageSchema.statics.markChatAsRead = async function(chatId, userId) {
  const messages = await this.find({
    chatId,
    senderId: { $ne: userId },
    readBy: { $not: { $elemMatch: { userId } } },
    isDeleted: false,
  });

  const promises = messages.map(msg => msg.markAsRead(userId));
  await Promise.all(promises);
};

module.exports = mongoose.model('Message', messageSchema);
