/**
 * User Service Server
 */

require('dotenv').config();
const app = require('./app');
const { database, redis, logger } = require('@mgrand-hub/shared');

const PORT = process.env.PORT || 3002;
const SERVICE_NAME = 'user-service';

process.env.SERVICE_NAME = SERVICE_NAME;

async function startServer() {
  try {
    await database.connect();
    logger.info('✓ Database connected');

    await redis.connect();
    logger.info('✓ Redis connected');

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

startServer();
