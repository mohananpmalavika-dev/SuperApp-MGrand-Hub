const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const Contact = require('../models/Contact.model');
const Call = require('../models/Call.model');
const logger = require('../../../packages/shared/src/logger');
const { emitToChat, emitToUser, emitToUsers } = require('../socket/socket');

/**
 * Messaging Service
 * Core business logic for messaging operations
 */
class MessagingService {
  /**
   * Create or get direct chat
   */
  async getOrCreateDirectChat(userId1, userId2) {
    try {
      // Check if chat already exists
      let chat = await Chat.findDirectChat(userId1, userId2);

      if (!chat) {
        chat = new Chat({
          type: 'direct',
          participants: [userId1, userId2],
          creator: userId1,
          isPrivate: true,
        });
        await chat.save();
        logger.info(`Direct chat created: ${chat._id}`);
      }

      return await chat.populate('participants', 'firstName lastName email avatar onlineStatus');
    } catch (error) {
      logger.error('Error creating direct chat:', error);
      throw error;
    }
  }

  /**
   * Create group chat
   */
  async createGroupChat(creatorId, data) {
    try {
      const { groupName, description, participants, isPrivate } = data;

      // Creator must be in participants
      const allParticipants = [...new Set([creatorId, ...participants])];

      const chat = new Chat({
        type: 'group',
        groupName,
        description,
        participants: allParticipants,
        admins: [creatorId],
        creator: creatorId,
        isPrivate: isPrivate !== false,
      });

      await chat.save();
      logger.info(`Group chat created: ${chat._id}`);

      // Notify participants
      allParticipants.forEach(participantId => {
        if (participantId !== creatorId) {
          emitToUser(participantId, 'chat:created', { chat });
        }
      });

      return await chat.populate('participants', 'firstName lastName email avatar');
    } catch (error) {
      logger.error('Error creating group chat:', error);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(senderId, messageData) {
    try {
      const { chatId, content, messageType, media, replyTo, poll, location, contact, scheduledFor } = messageData;

      // Verify user is participant
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      if (!chat.participants.some(p => p.equals(senderId))) {
        throw new Error('Not a participant of this chat');
      }

      // Check if user is muted
      if (chat.isUserMuted(senderId)) {
        throw new Error('You are muted in this chat');
      }

      // Create message
      const message = new Message({
        chatId,
        senderId,
        content,
        messageType: messageType || 'text',
        media,
        replyTo,
        poll,
        location,
        contact,
        scheduledFor,
        isScheduled: !!scheduledFor,
        deliveryStatus: 'sent',
        clientMessageId: messageData.clientMessageId,
      });

      await message.save();

      // Update chat's last message
      if (!scheduledFor || scheduledFor <= new Date()) {
        await chat.updateLastMessage(message);
      }

      // Populate sender info
      await message.populate('senderId', 'firstName lastName email avatar');

      // Emit to chat participants in real-time
      emitToChat(chatId, 'message:new', { message }, senderId);

      // Update contact interaction if direct chat
      if (chat.type === 'direct') {
        const recipientId = chat.participants.find(p => !p.equals(senderId));
        await this.updateContactInteraction(senderId, recipientId, 'message');
      }

      logger.info(`Message sent: ${message._id} in chat: ${chatId}`);

      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Edit message
   */
  async editMessage(messageId, userId, newContent) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (!message.senderId.equals(userId)) {
        throw new Error('Not authorized to edit this message');
      }

      await message.editContent(newContent);
      await message.populate('senderId', 'firstName lastName email avatar');

      // Emit update to chat
      emitToChat(message.chatId, 'message:edited', { message });

      return message;
    } catch (error) {
      logger.error('Error editing message:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId, deleteForEveryone = false) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (!message.senderId.equals(userId) && !deleteForEveryone) {
        throw new Error('Not authorized to delete this message');
      }

      if (deleteForEveryone) {
        // Check if user is admin or sender
        const chat = await Chat.findById(message.chatId);
        const isAdmin = chat.admins.some(a => a.equals(userId));
        const isSender = message.senderId.equals(userId);

        if (!isAdmin && !isSender) {
          throw new Error('Not authorized to delete for everyone');
        }

        await message.hardDelete();
        emitToChat(message.chatId, 'message:deleted', { messageId, deletedForEveryone: true });
      } else {
        await message.softDelete(userId);
        emitToUser(userId, 'message:deleted', { messageId, deletedForEveryone: false });
      }

      logger.info(`Message deleted: ${messageId} by ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId, userId, emoji) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      await message.addReaction(userId, emoji);

      // Emit to chat
      emitToChat(message.chatId, 'message:reaction', {
        messageId,
        userId,
        emoji,
        action: 'add',
      });

      return message;
    } catch (error) {
      logger.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId, userId, messageIds) {
    try {
      const messages = await Message.find({
        _id: { $in: messageIds },
        chatId,
      });

      const promises = messages.map(msg => msg.markAsRead(userId));
      await Promise.all(promises);

      // Notify sender(s)
      const senderIds = [...new Set(messages.map(m => m.senderId.toString()))];
      senderIds.forEach(senderId => {
        if (senderId !== userId.toString()) {
          emitToUser(senderId, 'message:read', {
            chatId,
            messageIds,
            userId,
            readAt: new Date(),
          });
        }
      });

      return { success: true };
    } catch (error) {
      logger.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Initiate call
   */
  async initiateCall(initiatorId, chatId, callType) {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        throw new Error('Chat not found');
      }

      if (!chat.participants.some(p => p.equals(initiatorId))) {
        throw new Error('Not a participant of this chat');
      }

      // Check if there's already an active call
      const activeCall = await Call.getActiveCall(initiatorId);
      if (activeCall) {
        throw new Error('Already in a call');
      }

      // Get ICE servers configuration
      const iceServers = this.getICEServers();

      const call = new Call({
        chatId,
        callType,
        initiator: initiatorId,
        status: 'ringing',
        iceServers,
        startTime: new Date(),
      });

      // Add all participants except initiator
      const otherParticipants = chat.participants.filter(p => !p.equals(initiatorId));
      otherParticipants.forEach(participantId => {
        call.participants.push({ userId: participantId, status: 'ringing' });
      });

      await call.save();

      // Notify participants
      otherParticipants.forEach(participantId => {
        emitToUser(participantId, 'call:incoming', {
          call,
          initiator: initiatorId,
          callType,
          chatId,
        });
      });

      logger.info(`Call initiated: ${call._id}`);

      return call;
    } catch (error) {
      logger.error('Error initiating call:', error);
      throw error;
    }
  }

  /**
   * Answer call
   */
  async answerCall(callId, userId) {
    try {
      const call = await Call.findById(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      await call.updateParticipantStatus(userId, 'answered');

      // Notify other participants
      emitToChat(call.chatId, 'call:answered', {
        callId,
        userId,
        timestamp: new Date(),
      });

      return call;
    } catch (error) {
      logger.error('Error answering call:', error);
      throw error;
    }
  }

  /**
   * End call
   */
  async endCall(callId, userId) {
    try {
      const call = await Call.findById(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      await call.endCall();

      // Notify all participants
      emitToChat(call.chatId, 'call:ended', {
        callId,
        endedBy: userId,
        duration: call.duration,
        timestamp: new Date(),
      });

      // Update contact interaction for direct calls
      const chat = await Chat.findById(call.chatId);
      if (chat.type === 'direct') {
        const otherParticipant = chat.participants.find(p => !p.equals(userId));
        await this.updateContactInteraction(userId, otherParticipant, 'call');
      }

      return call;
    } catch (error) {
      logger.error('Error ending call:', error);
      throw error;
    }
  }

  /**
   * Get user chats
   */
  async getUserChats(userId, options = {}) {
    try {
      return await Chat.getUserChats(userId, options);
    } catch (error) {
      logger.error('Error getting user chats:', error);
      throw error;
    }
  }

  /**
   * Get chat messages
   */
  async getChatMessages(chatId, userId, options = {}) {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        throw new Error('Chat not found');
      }

      if (!chat.participants.some(p => p.equals(userId))) {
        throw new Error('Not authorized to view this chat');
      }

      return await Message.getChatMessages(chatId, options);
    } catch (error) {
      logger.error('Error getting chat messages:', error);
      throw error;
    }
  }

  /**
   * Update contact interaction
   */
  async updateContactInteraction(userId, contactUserId, type) {
    try {
      const contact = await Contact.findOne({ userId, contactUserId });

      if (contact) {
        if (type === 'message') {
          await contact.updateLastMessaged();
        } else if (type === 'call') {
          await contact.updateLastCalled();
        }
      }
    } catch (error) {
      logger.error('Error updating contact interaction:', error);
    }
  }

  /**
   * Get ICE servers for WebRTC
   */
  getICEServers() {
    const stunServers = (process.env.WEBRTC_STUN_SERVERS || 'stun:stun.l.google.com:19302').split(',');
    const iceServers = [{ urls: stunServers }];

    if (process.env.WEBRTC_TURN_URLS) {
      iceServers.push({
        urls: process.env.WEBRTC_TURN_URLS.split(','),
        username: process.env.WEBRTC_TURN_USERNAME,
        credential: process.env.WEBRTC_TURN_CREDENTIAL,
      });
    }

    return iceServers;
  }

  /**
   * Search messages
   */
  async searchMessages(userId, query, options = {}) {
    try {
      // Get user's chats
      const chats = await Chat.find({
        participants: userId,
        isActive: true,
      }).select('_id');

      const chatIds = chats.map(c => c._id);

      const searchQuery = {
        chatId: { $in: chatIds },
        isDeleted: false,
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { 'media.filename': { $regex: query, $options: 'i' } },
        ],
      };

      if (options.messageType) {
        searchQuery.messageType = options.messageType;
      }

      if (options.chatId) {
        searchQuery.chatId = options.chatId;
      }

      return await Message.find(searchQuery)
        .populate('senderId', 'firstName lastName email avatar')
        .populate('chatId', 'type groupName')
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
    } catch (error) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }
}

module.exports = new MessagingService();
