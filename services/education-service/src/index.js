require('dotenv').config();
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const logger = require('./utils/logger');
const cache = require('./utils/cache');

const app = express();
const PORT = process.env.PORT || 3013;

if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(',')
      .map((server) => server.trim())
      .filter(Boolean)
  );
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Serve static files (audio, images, videos, slides, animations)
app.use('/api/education/audio', express.static('uploads/audio'));
app.use('/api/education/images', express.static('uploads/images'));
app.use('/api/education/videos', express.static('uploads/videos'));
app.use('/api/education/slides', express.static('uploads/slides'));
app.use('/api/education/animations', express.static('uploads/animations'));

// Connect to MongoDB with retry logic
const connectMongoDB = async (retries = 5, delay = 5000) => {
  if (!process.env.MONGO_URI) {
    logger.warn('MONGO_URI is not configured; CA Foundation bundled content remains available.');
    return;
  }

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      logger.info('MongoDB connected successfully');
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, {
        message: err.message,
        code: err.code,
      });
      if (i < retries - 1) {
        logger.info(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error('MongoDB connection failed after all retries. Service will continue without database.');
        logger.error('Please check: 1) Network connectivity, 2) MongoDB Atlas IP whitelist, 3) Credentials');
      }
    }
  }
};

connectMongoDB();

// Connect to Redis when enabled
if (process.env.REDIS_DISABLED !== 'true') {
  cache
    .connect()
    .then(() => {
      logger.info('Redis connected successfully');
    })
    .catch((err) => {
      logger.warn('Redis connection failed (will continue without cache):', err);
    });
} else {
  logger.info('Redis disabled; continuing without cache');
}

// Routes
app.use('/api/education', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI-Powered Education Service',
    version: '1.0.0',
    status: 'running',
    features: [
      'AI Course Generation (Groq + Gemini)',
      'AI Tutor Chat',
      'Voice Q&A (Edge TTS + Whisper)',
      'Adaptive Tests',
      'Personalized Study Plans',
      'Progress Analytics',
    ],
    endpoints: {
      health: '/api/education/health',
      courses: '/api/education/courses',
      tutor: '/api/education/tutor',
      tests: '/api/education/tests',
      progress: '/api/education/progress',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Education Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API: http://localhost:${PORT}/api/education`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
