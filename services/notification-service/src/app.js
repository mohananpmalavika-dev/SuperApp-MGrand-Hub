/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler, logger } = require('@mgrand-hub/shared');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    configured: {
      email: !!process.env.SMTP_USER,
      sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    },
  });
});

// API routes
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(errorHandler.notFound);

// Error handler
app.use(errorHandler.errorHandler);

module.exports = app;
