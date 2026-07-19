const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * Create a new chat
 */
exports.createChat = async (req, res) => {
  try {
    const { type, participants, name, description, isPublic } = req.body;
    const userId = req.user.userId;

    // Validate participants
    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }

    // For direct chat, check if chat already exists
    if (type === 'direct') {
      if (participants.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Direct chat must have exactly one other participant'
        });
      }

      const existingChat = await Chat.findOne({
        type: 'direct',
        participants: { $all: [userId, participants[0]], $size: 2 }
      });

      if (existingChat) {
        return res.json({
          success: true,
          message: 'Chat already exists',
          data: existingChat
        });
      }
    }

    // Create chat
    const chat = await Chat.create({
      type: type || 'direct',
      name,
      description,
      isPublic: isPublic || false,
      participants: [userId, ...participants],
      creator: userId,
      admins: type === 'group' || type === 'channel' ? [userId] : []
    });

    await chat.populate('participants', 'name email avatar');

    logger.info('Chat created', { chatId: chat._id, type, userId });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    });
  } catch (error) {
    logger.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
};

/**
 * Get user's chats
 */
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, search, limit = 50, skip = 0 } = req.query;

    const query = {
      participants: userId
    };

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const chats = await Chat.find(query)
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .populate('admins', 'name')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Add unread count for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: chatsWithUnread,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: chatsWithUnread.length
      }
    });
  } catch (error) {
    logger.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};

/**
 * Get chat by ID
 */
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email avatar')
      .populate('admins', 'name email')
      .populate('creator', 'name');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this chat'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    logger.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
};

/**
 * Send message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type, replyTo, attachments, metadata } = req.body;
    const userId = req.user.userId;

    // Validate chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check participant
    if (!chat.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this chat'
      });
    }

    // Check permissions for group/channel
    if ((chat.type === 'group' || chat.type === 'channel') && 
        chat.settings.whoCanSendMessages === 'admins' && 
        !chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can send messages in this chat'
      });
    }

    // Create message
    const message = await Message.create({
      chatId,
      sender: userId,
      content,
      type: type || 'text',
      replyTo,
      attachments: attachments || [],
      metadata: metadata || {},
      platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web'
    });

    await message.populate('sender', 'name email avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    chat.messageCount += 1;
    await chat.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(chatId).emit('newMessage', {
        chatId,
        message
      });
    }

    logger.info('Message sent', { messageId: message._id, chatId, userId });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Get chat messages
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0, before } = req.query;
    const userId = req.user.userId;

    // Validate chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check participant
    if (!chat.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this chat'
      });
    }

    const query = {
      chatId,
      deleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .populate('reactions.user', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

/**
 * Edit message
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Save original content
    if (!message.edited) {
      message.originalContent = message.content;
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(message.chatId.toString()).emit('messageEdited', {
        messageId,
        content,
        editedAt: message.editedAt
      });
    }

    res.json({
      success: true,
      message: 'Message edited successfully',
      data: message
    });
  } catch (error) {
    logger.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
};

/**
 * Delete message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    if (deleteForEveryone) {
      message.deleted = true;
      message.deletedAt = new Date();
      message.content = 'This message was deleted';
      message.attachments = [];
    } else {
      message.deletedFor.push(userId);
    }

    await message.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(message.chatId.toString()).emit('messageDeleted', {
        messageId,
        deleteForEveryone
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * React to message
 */
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (emoji) {
      await message.addReaction(userId, emoji);
    } else {
      await message.removeReaction(userId);
    }

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(message.chatId.toString()).emit('messageReaction', {
        messageId,
        userId,
        emoji,
        reactions: message.reactions
      });
    }

    res.json({
      success: true,
      message: emoji ? 'Reaction added' : 'Reaction removed',
      data: message.reactions
    });
  } catch (error) {
    logger.error('React to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to message',
      error: error.message
    });
  }
};

/**
 * Mark messages as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Mark all unread messages as read
    const messages = await Message.find({
      chatId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId }
    });

    await Promise.all(
      messages.map(message => message.markAsRead(userId))
    );

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(chatId).emit('messagesRead', {
        chatId,
        userId,
        count: messages.length
      });
    }

    res.json({
      success: true,
      message: `${messages.length} messages marked as read`
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

/**
 * Search messages
 */
exports.searchMessages = async (req, res) => {
  try {
    const { query, chatId, from, before, after } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Get user's chats
    const userChats = await Chat.find({ participants: userId }).select('_id');
    const chatIds = userChats.map(c => c._id);

    const searchQuery = {
      chatId: chatId ? chatId : { $in: chatIds },
      content: { $regex: query, $options: 'i' },
      deleted: false
    };

    if (from) {
      searchQuery.sender = from;
    }

    if (before) {
      searchQuery.createdAt = { ...searchQuery.createdAt, $lt: new Date(before) };
    }

    if (after) {
      searchQuery.createdAt = { ...searchQuery.createdAt, $gt: new Date(after) };
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'name email avatar')
      .populate('chatId', 'name type')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    logger.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
};

/**
 * Add participants to group
 */
exports.addParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participants } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (chat.settings.whoCanAddMembers === 'admins' && !chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members'
      });
    }

    // Add participants
    const added = [];
    for (const participantId of participants) {
      if (!chat.hasParticipant(participantId)) {
        await chat.addParticipant(participantId);
        added.push(participantId);
      }
    }

    // Create system message
    if (added.length > 0) {
      await Message.create({
        chatId,
        sender: userId,
        type: 'system',
        content: `${added.length} participant(s) added to the group`
      });
    }

    res.json({
      success: true,
      message: `${added.length} participant(s) added`,
      data: chat
    });
  } catch (error) {
    logger.error('Add participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participants',
      error: error.message
    });
  }
};

/**
 * Leave chat
 */
exports.leaveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.type === 'direct') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave direct chat'
      });
    }

    await chat.removeParticipant(userId);

    // Create system message
    await Message.create({
      chatId,
      sender: userId,
      type: 'system',
      content: 'User left the group'
    });

    res.json({
      success: true,
      message: 'Left chat successfully'
    });
  } catch (error) {
    logger.error('Leave chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat',
      error: error.message
    });
  }
};

module.exports = exports;
