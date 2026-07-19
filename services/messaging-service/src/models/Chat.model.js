const mongoose = require('mongoose');

/**
 * Chat Model
 * Supports: Direct messages, Group chats, Chatrooms
 */
const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'chatroom'],
    required: true,
    index: true,
  },
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Group/Chatroom specific
  groupName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  avatar: {
    type: String,
    trim: true,
  },
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: true,
  },
  inviteLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  inviteLinkExpiry: {
    type: Date,
  },
  // Chat settings
  settings: {
    encryption: {
      enabled: { type: Boolean, default: true },
      keyRotationInterval: { type: Number, default: 2592000000 }, // 30 days
    },
    allowMediaSharing: { type: Boolean, default: true },
    allowPolls: { type: Boolean, default: true },
    allowVoiceCalls: { type: Boolean, default: true },
    allowVideoCalls: { type: Boolean, default: true },
    messageRetention: {
      enabled: { type: Boolean, default: false },
      daysToKeep: { type: Number, default: 90 },
    },
    readReceipts: { type: Boolean, default: true },
    typingIndicators: { type: Boolean, default: true },
    onlineStatus: { type: Boolean, default: true },
  },
  // Last message for preview
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    messageType: String,
  },
  // Pinned messages
  pinnedMessages: [{
    messageId: mongoose.Schema.Types.ObjectId,
    pinnedBy: mongoose.Schema.Types.ObjectId,
    pinnedAt: Date,
  }],
  // Muted participants
  mutedParticipants: [{
    userId: mongoose.Schema.Types.ObjectId,
    mutedUntil: Date,
  }],
  // Blocked participants
  blockedUsers: [{
    userId: mongoose.Schema.Types.ObjectId,
    blockedAt: Date,
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  // Message count
  messageCount: {
    type: Number,
    default: 0,
  },
  // Metadata
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes for performance
chatSchema.index({ participants: 1, isActive: 1 });
chatSchema.index({ type: 1, isActive: 1, createdAt: -1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ inviteLink: 1 });

// Virtual for unread count (handled separately)
chatSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatId',
  count: true,
});

// Methods
chatSchema.methods.addParticipant = async function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
};

chatSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => !p.equals(userId));
  this.admins = this.admins.filter(a => !a.equals(userId));
  await this.save();
};

chatSchema.methods.addAdmin = async function(userId) {
  if (this.participants.includes(userId) && !this.admins.includes(userId)) {
    this.admins.push(userId);
    await this.save();
  }
};

chatSchema.methods.removeAdmin = async function(userId) {
  this.admins = this.admins.filter(a => !a.equals(userId));
  await this.save();
};

chatSchema.methods.muteParticipant = async function(userId, duration) {
  const mutedUntil = duration ? new Date(Date.now() + duration) : new Date('2099-12-31');
  
  const existing = this.mutedParticipants.find(m => m.userId.equals(userId));
  if (existing) {
    existing.mutedUntil = mutedUntil;
  } else {
    this.mutedParticipants.push({ userId, mutedUntil });
  }
  
  await this.save();
};

chatSchema.methods.isUserMuted = function(userId) {
  const muted = this.mutedParticipants.find(m => m.userId.equals(userId));
  return muted && muted.mutedUntil > new Date();
};

chatSchema.methods.generateInviteLink = async function() {
  const crypto = require('crypto');
  this.inviteLink = crypto.randomBytes(16).toString('hex');
  this.inviteLinkExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await this.save();
  return this.inviteLink;
};

chatSchema.methods.updateLastMessage = async function(message) {
  this.lastMessage = {
    content: message.content,
    senderId: message.senderId,
    timestamp: message.createdAt || new Date(),
    messageType: message.messageType,
  };
  this.messageCount += 1;
  await this.save();
};

// Static methods
chatSchema.statics.findDirectChat = async function(userId1, userId2) {
  return await this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2] },
    isActive: true,
  });
};

chatSchema.statics.getUserChats = async function(userId, options = {}) {
  const query = {
    participants: userId,
    isActive: true,
  };

  if (options.type) {
    query.type = options.type;
  }

  if (options.isArchived !== undefined) {
    query.isArchived = options.isArchived;
  }

  return await this.find(query)
    .populate('participants', 'firstName lastName email avatar')
    .populate('lastMessage.senderId', 'firstName lastName')
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('Chat', chatSchema);
