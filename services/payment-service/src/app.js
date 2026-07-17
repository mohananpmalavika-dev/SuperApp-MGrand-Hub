/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler, logger } = require('@mgrand-hub/shared');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false,
}));

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    razorpay: {
      configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    },
  });
});

// API routes
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use(errorHandler.notFound);

// Error handler
app.use(errorHandler.errorHandler);

module.exports = app;
