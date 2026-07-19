const messagingService = require('../services/messaging.service');
const aiService = require('../services/ai.service');
const encryptionService = require('../services/encryption.service');
const storageService = require('../services/storage.service');

class MessagingController {
  // Chat Management
  async createChat(req, res) {
    try {
      const { type, participants, name, description, settings } = req.body;
      const userId = req.user.id;

      const chat = await messagingService.createChat({
        type,
        participants: [userId, ...participants],
        name,
        description,
        createdBy: userId,
        settings
      });

      res.status(201).json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      const { type, page = 1, limit = 20 } = req.query;

      const chats = await messagingService.getUserChats(userId, {
        type,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      console.error('Get user chats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getChatById(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await messagingService.getChatById(chatId, userId);

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('Get chat error:', error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const chat = await messagingService.updateChat(chatId, userId, updates);

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('Update chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      await messagingService.deleteChat(chatId, userId);

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });
    } catch (error) {
      console.error('Delete chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async leaveChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      await messagingService.leaveChat(chatId, userId);

      res.json({
        success: true,
        message: 'Left chat successfully'
      });
    } catch (error) {
      console.error('Leave chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Message Management
  async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const messageData = req.body;

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const mediaUrls = await storageService.uploadMultiple(req.files);
        messageData.media = mediaUrls;
      }

      // Encrypt message if required
      if (messageData.encrypted) {
        messageData.content = await encryptionService.encrypt(messageData.content);
      }

      const message = await messagingService.sendMessage(chatId, userId, messageData);

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 50, before, after } = req.query;

      const messages = await messagingService.getChatMessages(chatId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        before,
        after
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      const { content } = req.body;

      const message = await messagingService.editMessage(messageId, userId, content);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      const { deleteForEveryone } = req.query;

      await messagingService.deleteMessage(messageId, userId, deleteForEveryone === 'true');

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async reactToMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      const { emoji } = req.body;

      const message = await messagingService.reactToMessage(messageId, userId, emoji);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('React to message error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { messageIds } = req.body;

      await messagingService.markAsRead(chatId, userId, messageIds);

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Search
  async searchMessages(req, res) {
    try {
      const userId = req.user.id;
      const { query, chatId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

      const results = await messagingService.searchMessages(userId, {
        query,
        chatId,
        type,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // AI Features
  async getSmartReply(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const suggestions = await aiService.generateSmartReply(messageId, userId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Smart reply error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async translateMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { targetLanguage } = req.body;

      const translation = await aiService.translateMessage(messageId, targetLanguage);

      res.json({
        success: true,
        data: translation
      });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async summarizeChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { limit = 100 } = req.query;

      const summary = await aiService.summarizeChat(chatId, userId, parseInt(limit));

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Summarize chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calls
  async initiateCall(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { type, video } = req.body;

      const call = await messagingService.initiateCall(chatId, userId, { type, video });

      res.status(201).json({
        success: true,
        data: call
      });
    } catch (error) {
      console.error('Initiate call error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async answerCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      const call = await messagingService.answerCall(callId, userId);

      res.json({
        success: true,
        data: call
      });
    } catch (error) {
      console.error('Answer call error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async endCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      const call = await messagingService.endCall(callId, userId);

      res.json({
        success: true,
        data: call
      });
    } catch (error) {
      console.error('End call error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Contacts
  async getContacts(req, res) {
    try {
      const userId = req.user.id;
      const { category, search } = req.query;

      const contacts = await messagingService.getContacts(userId, { category, search });

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async addContact(req, res) {
    try {
      const userId = req.user.id;
      const { contactUserId, nickname, category } = req.body;

      const contact = await messagingService.addContact(userId, contactUserId, { nickname, category });

      res.status(201).json({
        success: true,
        data: contact
      });
    } catch (error) {
      console.error('Add contact error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async blockUser(req, res) {
    try {
      const userId = req.user.id;
      const { blockedUserId } = req.body;

      await messagingService.blockUser(userId, blockedUserId);

      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Media Upload
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const url = await storageService.uploadFile(req.file);

      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      console.error('Upload media error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Statistics
  async getChatStats(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const stats = await messagingService.getChatStats(chatId, userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get chat stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MessagingController();
