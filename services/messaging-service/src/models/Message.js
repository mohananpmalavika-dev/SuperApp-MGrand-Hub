const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'system'],
    default: 'text',
    index: true
  },
  // Media attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', 'location', 'contact']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
    thumbnail: String,
    duration: Number, // for video/audio
    dimensions: {
      width: Number,
      height: Number
    }
  }],
  // Reply/Forward
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Delivery status
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Edit history
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  originalContent: String,
  // Delete
  deleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deletedAt: Date,
  // Message metadata
  metadata: {
    linkPreview: {
      url: String,
      title: String,
      description: String,
      image: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    }
  },
  // Encryption
  encrypted: {
    type: Boolean,
    default: false
  },
  // Platform info
  platform: {
    type: String,
    enum: ['web', 'ios', 'android', 'desktop'],
    default: 'web'
  },
  // AI features
  translated: [{
    language: String,
    text: String
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral']
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ deleted: 1 });

// Virtual for checking if message is read by specific user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Mark as read by user
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId, readAt: new Date() });
    await this.save();
  }
  return this;
};

// Add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingReaction) {
    existingReaction.emoji = emoji;
  } else {
    this.reactions.push({ user: userId, emoji });
  }
  
  await this.save();
  return this;
};

// Remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Message', messageSchema);
