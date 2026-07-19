const mongoose = require('mongoose');

/**
 * Call Model
 * Supports voice and video calls with WebRTC
 */
const callSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  callType: {
    type: String,
    enum: ['voice', 'video'],
    required: true,
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ringing', 'answered', 'declined', 'missed', 'busy', 'failed'],
      default: 'ringing',
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number,
  }],
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'ongoing', 'ended', 'cancelled', 'failed'],
    default: 'initiated',
    index: true,
  },
  // WebRTC connection details
  iceServers: [{
    urls: [String],
    username: String,
    credential: String,
  }],
  // Call quality metrics
  quality: {
    audio: {
      bitrate: Number,
      packetLoss: Number,
      jitter: Number,
    },
    video: {
      bitrate: Number,
      packetLoss: Number,
      frameRate: Number,
      resolution: String,
    },
  },
  // Recording
  recording: {
    enabled: { type: Boolean, default: false },
    url: String,
    duration: Number,
    size: Number,
  },
  // Timestamps
  startTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  // Error tracking
  error: {
    code: String,
    message: String,
    timestamp: Date,
  },
}, {
  timestamps: true,
});

// Indexes
callSchema.index({ initiator: 1, createdAt: -1 });
callSchema.index({ 'participants.userId': 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });

// Methods
callSchema.methods.addParticipant = async function(userId, status = 'ringing') {
  const existing = this.participants.find(p => p.userId.equals(userId));
  if (!existing) {
    this.participants.push({ userId, status });
    await this.save();
  }
};

callSchema.methods.updateParticipantStatus = async function(userId, status) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (participant) {
    participant.status = status;
    if (status === 'answered') {
      participant.joinedAt = new Date();
      this.status = 'ongoing';
      if (!this.startTime) {
        this.startTime = new Date();
      }
    } else if (['declined', 'missed', 'busy'].includes(status)) {
      participant.leftAt = new Date();
    }
    await this.save();
  }
};

callSchema.methods.endCall = async function() {
  this.status = 'ended';
  this.endTime = new Date();
  
  if (this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }

  // Update participant durations
  this.participants.forEach(p => {
    if (p.joinedAt && !p.leftAt) {
      p.leftAt = this.endTime;
      p.duration = Math.floor((p.leftAt - p.joinedAt) / 1000);
    }
  });

  await this.save();
};

callSchema.methods.cancelCall = async function() {
  this.status = 'cancelled';
  this.endTime = new Date();
  await this.save();
};

callSchema.methods.failCall = async function(errorCode, errorMessage) {
  this.status = 'failed';
  this.endTime = new Date();
  this.error = {
    code: errorCode,
    message: errorMessage,
    timestamp: new Date(),
  };
  await this.save();
};

// Static methods
callSchema.statics.getUserCallHistory = async function(userId, options = {}) {
  const query = {
    $or: [
      { initiator: userId },
      { 'participants.userId': userId },
    ],
    status: { $in: ['ended', 'cancelled', 'failed'] },
  };

  if (options.callType) {
    query.callType = options.callType;
  }

  return await this.find(query)
    .populate('initiator', 'firstName lastName avatar')
    .populate('participants.userId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

callSchema.statics.getActiveCall = async function(userId) {
  return await this.findOne({
    $or: [
      { initiator: userId },
      { 'participants.userId': userId },
    ],
    status: { $in: ['initiated', 'ringing', 'ongoing'] },
  }).populate('initiator', 'firstName lastName avatar')
    .populate('participants.userId', 'firstName lastName avatar');
};

module.exports = mongoose.model('Call', callSchema);
