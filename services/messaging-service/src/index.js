const { server } = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3007;

server.listen(PORT, () => {
  logger.info(`Messaging Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Socket.IO enabled for real-time messaging`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
