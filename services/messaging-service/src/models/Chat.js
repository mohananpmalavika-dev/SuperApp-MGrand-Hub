const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'channel', 'broadcast'],
    default: 'direct',
    required: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Group/Channel specific
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Privacy settings
  isPublic: {
    type: Boolean,
    default: false
  },
  inviteLink: {
    type: String,
    unique: true,
    sparse: true
  },
  // Group settings
  settings: {
    whoCanSendMessages: {
      type: String,
      enum: ['all', 'admins'],
      default: 'all'
    },
    whoCanAddMembers: {
      type: String,
      enum: ['all', 'admins'],
      default: 'admins'
    },
    whoCanEditInfo: {
      type: String,
      enum: ['all', 'admins'],
      default: 'admins'
    },
    disappearingMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number, // in seconds
        default: 86400 // 24 hours
      }
    },
    encryption: {
      type: Boolean,
      default: false
    }
  },
  // Last message
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    index: true
  },
  // Muted by users
  mutedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mutedUntil: Date
  }],
  // Pinned messages
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  // Archive
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Metrics
  messageCount: {
    type: Number,
    default: 0
  },
  // Platform tracking
  platforms: [{
    type: String,
    enum: ['web', 'ios', 'android', 'desktop']
  }]
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ participants: 1, lastMessageAt: -1 });
chatSchema.index({ type: 1, isPublic: 1 });
chatSchema.index({ inviteLink: 1 });

// Check if user is participant
chatSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Check if user is admin
chatSchema.methods.isAdmin = function(userId) {
  if (this.type === 'direct') return true;
  return this.admins.some(a => a.toString() === userId.toString());
};

// Add participant
chatSchema.methods.addParticipant = async function(userId) {
  if (!this.hasParticipant(userId)) {
    this.participants.push(userId);
    await this.save();
  }
  return this;
};

// Remove participant
chatSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(
    p => p.toString() !== userId.toString()
  );
  this.admins = this.admins.filter(
    a => a.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

// Add admin
chatSchema.methods.addAdmin = async function(userId) {
  if (this.hasParticipant(userId) && !this.isAdmin(userId)) {
    this.admins.push(userId);
    await this.save();
  }
  return this;
};

// Generate invite link
chatSchema.methods.generateInviteLink = async function() {
  const crypto = require('crypto');
  this.inviteLink = crypto.randomBytes(16).toString('hex');
  await this.save();
  return this.inviteLink;
};

// Mute chat for user
chatSchema.methods.muteForUser = async function(userId, duration) {
  const existingMute = this.mutedBy.find(
    m => m.user.toString() === userId.toString()
  );
  
  if (existingMute) {
    existingMute.mutedUntil = duration ? new Date(Date.now() + duration) : null;
  } else {
    this.mutedBy.push({
      user: userId,
      mutedUntil: duration ? new Date(Date.now() + duration) : null
    });
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Chat', chatSchema);
