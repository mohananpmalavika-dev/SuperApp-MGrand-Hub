/**
 * MongoDB Database Connection
 */

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Log connection attempt (hide password)
    const uriToLog = process.env.MONGODB_URI 
      ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
      : 'NOT SET';
    logger.info(`Attempting MongoDB connection to: ${uriToLog}`);

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    process.exit(1);
  }
};

module.exports = { connectDB };
