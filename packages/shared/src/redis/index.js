/**
 * Redis Client Manager
 * Provides Redis connection and common caching operations
 */

const Redis = require('ioredis');
const logger = require('../logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   * @param {object} options - Redis connection options
   */
  connect(options = {}) {
    try {
      const defaultOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      };

      const redisOptions = { ...defaultOptions, ...options };

      // Main client for general operations
      this.client = new Redis(redisOptions);

      // Subscriber client for pub/sub
      this.subscriber = new Redis(redisOptions);

      // Publisher client for pub/sub
      this.publisher = new Redis(redisOptions);

      // Event listeners for main client
      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis connection error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client) await this.client.quit();
      if (this.subscriber) await this.subscriber.quit();
      if (this.publisher) await this.publisher.quit();
      this.isConnected = false;
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   */
  async deletePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Redis DELETE PATTERN error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration on key
   * @param {string} key - Cache key
   * @param {number} seconds - Expiration time in seconds
   */
  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment value
   * @param {string} key - Cache key
   * @param {number} increment - Increment amount (default: 1)
   */
  async increment(key, increment = 1) {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      logger.error(`Redis INCREMENT error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Publish message to channel
   * @param {string} channel - Channel name
   * @param {any} message - Message to publish
   */
  async publish(channel, message) {
    try {
      const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
      await this.publisher.publish(channel, stringMessage);
      return true;
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
      return false;
    }
  }

  /**
   * Subscribe to channel
   * @param {string} channel - Channel name
   * @param {function} callback - Callback function
   */
  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch {
            callback(message);
          }
        }
      });
      return true;
    } catch (error) {
      logger.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', healthy: false };
      }

      const pong = await this.client.ping();
      
      return {
        status: 'connected',
        healthy: pong === 'PONG',
        response: pong,
      };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'error',
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Get client instance
   */
  getClient() {
    return this.client;
  }
}

// Export singleton instance
module.exports = new RedisClient();
