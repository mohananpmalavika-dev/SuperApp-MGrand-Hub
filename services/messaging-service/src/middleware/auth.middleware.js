const jwt = require('jsonwebtoken');
const axios = require('axios');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Optionally validate with auth service
    if (process.env.AUTH_SERVICE_URL) {
      try {
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data.success) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token'
          });
        }
        
        req.user = response.data.user;
      } catch (error) {
        console.error('Auth service validation error:', error.message);
        // Fall back to decoded token data
        req.user = decoded;
      }
    } else {
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = { authenticate };
