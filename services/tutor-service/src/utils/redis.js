/**
 * Redis Connection Utility
 */

const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (redisClient) {
      return redisClient;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    return redisClient;
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache:', error.message);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
