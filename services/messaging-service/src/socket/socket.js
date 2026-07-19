const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../../../packages/shared/src/logger');

let io;

/**
 * Socket.IO configuration and event handlers
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded.userId;
      socket.user = decoded;
      
      logger.info(`Socket authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Update online status
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Handle joining chat rooms
    socket.on('chat:join', async (chatId) => {
      try {
        socket.join(`chat:${chatId}`);
        logger.info(`User ${socket.userId} joined chat: ${chatId}`);
        
        // Notify others in the chat
        socket.to(`chat:${chatId}`).emit('user:joined', {
          userId: socket.userId,
          chatId,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.to(`chat:${chatId}`).emit('user:left', {
        userId: socket.userId,
        chatId,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', {
        userId: socket.userId,
        chatId,
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', {
        userId: socket.userId,
        chatId,
      });
    });

    // Handle message sending (will be processed by API, but we can acknowledge)
    socket.on('message:send', (data) => {
      logger.info(`Message send event from ${socket.userId}`);
      // Message will be processed by REST API, this is just for real-time feedback
    });

    // Handle message read receipts
    socket.on('message:read', ({ chatId, messageId }) => {
      socket.to(`chat:${chatId}`).emit('message:read', {
        userId: socket.userId,
        chatId,
        messageId,
        readAt: new Date(),
      });
    });

    // Handle message delivered receipts
    socket.on('message:delivered', ({ chatId, messageId }) => {
      socket.to(`chat:${chatId}`).emit('message:delivered', {
        userId: socket.userId,
        chatId,
        messageId,
        deliveredAt: new Date(),
      });
    });

    // WebRTC signaling for calls
    socket.on('call:offer', ({ callId, to, offer }) => {
      io.to(`user:${to}`).emit('call:offer', {
        callId,
        from: socket.userId,
        offer,
      });
    });

    socket.on('call:answer', ({ callId, to, answer }) => {
      io.to(`user:${to}`).emit('call:answer', {
        callId,
        from: socket.userId,
        answer,
      });
    });

    socket.on('call:ice-candidate', ({ callId, to, candidate }) => {
      io.to(`user:${to}`).emit('call:ice-candidate', {
        callId,
        from: socket.userId,
        candidate,
      });
    });

    socket.on('call:end', ({ callId, chatId }) => {
      socket.to(`chat:${chatId}`).emit('call:end', {
        callId,
        from: socket.userId,
      });
    });

    // Handle presence updates
    socket.on('presence:update', ({ status }) => {
      socket.broadcast.emit('presence:update', {
        userId: socket.userId,
        status,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      
      // Update offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  return io;
};

/**
 * Emit event to specific user
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to chat room
 */
const emitToChat = (chatId, event, data, excludeUserId = null) => {
  if (io) {
    if (excludeUserId) {
      io.to(`chat:${chatId}`).except(`user:${excludeUserId}`).emit(event, data);
    } else {
      io.to(`chat:${chatId}`).emit(event, data);
    }
  }
};

/**
 * Emit event to multiple users
 */
const emitToUsers = (userIds, event, data) => {
  if (io && Array.isArray(userIds)) {
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit(event, data);
    });
  }
};

/**
 * Broadcast event to all connected users
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Get connected users count
 */
const getConnectedUsersCount = () => {
  if (io) {
    return io.sockets.sockets.size;
  }
  return 0;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  if (io) {
    const room = io.sockets.adapter.rooms.get(`user:${userId}`);
    return room && room.size > 0;
  }
  return false;
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToChat,
  emitToUsers,
  broadcast,
  getConnectedUsersCount,
  isUserOnline,
};
