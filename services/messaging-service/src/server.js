require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { initializeSocket } = require('./socket/socket');

const PORT = process.env.PORT || 3007;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/messaging';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Store io instance in app for use in controllers
app.set('io', io);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Start server after DB connection
    server.listen(PORT, () => {
      console.log(`🚀 Messaging Service running on port ${PORT}`);
      console.log(`📡 Socket.IO enabled on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  try {
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO connections closed');
    });

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

module.exports = server;
