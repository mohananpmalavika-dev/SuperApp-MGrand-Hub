/**
 * Auth Service Server
 */

require('dotenv').config();
const app = require('./app');
const { database, redis, logger } = require('@mgrand-hub/shared');

const PORT = process.env.PORT || 3001;
const SERVICE_NAME = 'auth-service';

// Set service name
process.env.SERVICE_NAME = SERVICE_NAME;

/**
 * Start server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    logger.info('✓ Database connected');

    // Connect to Redis
    await redis.connect();
    logger.info('✓ Redis connected');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`✓ ${SERVICE_NAME} running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  await redis.disconnect();
  process.exit(0);
});

// Start the server
startServer();
