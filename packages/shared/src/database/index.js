/**
 * MongoDB Database Connection Manager
 * Provides connection management and common database operations
 */

const mongoose = require('mongoose');
const logger = require('../logger');

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @param {string} uri - MongoDB connection URI
   * @param {object} options - Mongoose connection options
   */
  async connect(uri = process.env.MONGO_URI, options = {}) {
    try {
      if (this.isConnected) {
        logger.info('Using existing database connection');
        return this.connection;
      }

      const defaultOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      };

      const connectionOptions = { ...defaultOptions, ...options };

      logger.info('Connecting to MongoDB...');
      
      await mongoose.connect(uri, connectionOptions);
      
      this.connection = mongoose.connection;
      this.isConnected = true;

      // Connection event listeners
      this.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      this.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        logger.info('MongoDB disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', healthy: false };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        healthy: true,
        ...this.getStatus(),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Get database instance
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Get Mongoose instance
   */
  getMongoose() {
    return mongoose;
  }
}

// Export singleton instance
module.exports = new Database();
