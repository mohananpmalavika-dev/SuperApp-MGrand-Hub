require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
const contentGenerationRoutes = require('./routes/contentGeneration');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Create necessary directories
async function initDirectories() {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../outputs'),
    path.join(__dirname, '../logs'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'content-generation-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/content-generation', contentGenerationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await initDirectories();
    logger.info('Directories initialized');

    app.listen(PORT, () => {
      logger.info(`Content Generation Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
