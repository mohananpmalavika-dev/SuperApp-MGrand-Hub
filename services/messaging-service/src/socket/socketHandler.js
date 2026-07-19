const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// Store active connections
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

const socketHandler = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    logger.info('User connected', { userId, socketId: socket.id });
    
    // Store active user
    activeUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    // Emit online status
    socket.broadcast.emit('userOnline', userId);

    // Join user's chats
    try {
      const userChats = await Chat.find({ participants: userId }).select('_id');
      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });
      
      logger.info('User joined chats', { userId, chatCount: userChats.length });
    } catch (error) {
      logger.error('Error joining chats:', error);
    }

    // Handle typing indicator
    socket.on('typing', async (data) => {
      const { chatId, isTyping } = data;
      
      try {
        // Verify user is in chat
        const chat = await Chat.findById(chatId);
        if (chat && chat.hasParticipant(userId)) {
          socket.to(chatId).emit('userTyping', {
            chatId,
            userId,
            isTyping
          });
        }
      } catch (error) {
        logger.error('Typing event error:', error);
      }
    });

    // Handle join chat
    socket.on('joinChat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.hasParticipant(userId)) {
          socket.join(chatId);
          socket.emit('joinedChat', { chatId });
          logger.info('User joined chat', { userId, chatId });
        }
      } catch (error) {
        logger.error('Join chat error:', error);
      }
    });

    // Handle leave chat
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      socket.emit('leftChat', { chatId });
      logger.info('User left chat', { userId, chatId });
    });

    // Handle message delivery confirmation
    socket.on('messageDelivered', async (data) => {
      const { messageId } = data;
      
      try {
        const message = await Message.findById(messageId);
        if (message) {
          const deliveredTo = message.deliveredTo || [];
          if (!deliveredTo.some(d => d.user.toString() === userId)) {
            message.deliveredTo.push({
              user: userId,
              deliveredAt: new Date()
            });
            await message.save();
            
            // Notify sender
            socket.to(message.chatId.toString()).emit('messageDelivered', {
              messageId,
              userId,
              deliveredAt: new Date()
            });
          }
        }
      } catch (error) {
        logger.error('Message delivered error:', error);
      }
    });

    // Handle message read
    socket.on('messageRead', async (data) => {
      const { messageId } = data;
      
      try {
        const message = await Message.findById(messageId);
        if (message) {
          await message.markAsRead(userId);
          
          // Notify sender
          socket.to(message.chatId.toString()).emit('messageRead', {
            messageId,
            userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        logger.error('Message read error:', error);
      }
    });

    // Handle voice call
    socket.on('callUser', async (data) => {
      const { chatId, callType, offer } = data;
      
      try {
        const chat = await Chat.findById(chatId).populate('participants', '_id');
        if (chat && chat.hasParticipant(userId)) {
          // Notify other participants
          chat.participants.forEach(participant => {
            if (participant._id.toString() !== userId) {
              const recipientSocketId = activeUsers.get(participant._id.toString());
              if (recipientSocketId) {
                io.to(recipientSocketId).emit('incomingCall', {
                  chatId,
                  callType,
                  from: userId,
                  offer
                });
              }
            }
          });
        }
      } catch (error) {
        logger.error('Call user error:', error);
      }
    });

    // Handle call answer
    socket.on('answerCall', (data) => {
      const { to, answer } = data;
      const recipientSocketId = activeUsers.get(to);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('callAnswered', {
          from: userId,
          answer
        });
      }
    });

    // Handle ICE candidates for WebRTC
    socket.on('iceCandidate', (data) => {
      const { to, candidate } = data;
      const recipientSocketId = activeUsers.get(to);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('iceCandidate', {
          from: userId,
          candidate
        });
      }
    });

    // Handle call end
    socket.on('endCall', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('callEnded', {
        from: userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info('User disconnected', { userId, socketId: socket.id });
      
      // Remove from active users
      activeUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Emit offline status
      socket.broadcast.emit('userOffline', userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { userId, error: error.message });
    });
  });

  return io;
};

// Helper function to emit to specific user
const emitToUser = (io, userId, event, data) => {
  const socketId = activeUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};

module.exports = {
  socketHandler,
  emitToUser,
  isUserOnline,
  getOnlineUsers
};
