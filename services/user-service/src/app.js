/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/user.routes');
const { errorHandler, logger } = require('@mgrand-hub/shared');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/users', userRoutes);
app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

module.exports = app;
