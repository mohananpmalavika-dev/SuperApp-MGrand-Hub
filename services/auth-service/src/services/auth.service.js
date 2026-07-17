/**
 * Authentication Service
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const { logger, redis, ApiError } = require('@mgrand-hub/shared');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    try {
      const { email, password, name, phone } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, ...(phone ? [{ phone }] : [])]
      });

      if (existingUser) {
        throw new ApiError(400, 'User already exists with this email or phone');
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        phone,
      });

      // Generate OTP for email verification
      const otp = await this.generateOTP(email, 'email_verification');

      logger.info('User registered successfully', { userId: user._id, email });

      return {
        user,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email, isActive: true });

      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      await user.save();

      // Cache user session
      await redis.set(`session:${user._id}`, {
        userId: user._id,
        email: user.email,
        role: user.role,
      }, 7 * 24 * 60 * 60); // 7 days

      logger.info('User logged in successfully', { userId: user._id, email });

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);

      if (!tokenExists) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      logger.info('Access token refreshed', { userId: user._id });

      return { accessToken };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId, refreshToken) {
    try {
      const user = await User.findById(userId);

      if (user) {
        // Remove refresh token
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        await user.save();

        // Remove session from cache
        await redis.delete(`session:${userId}`);
      }

      logger.info('User logged out successfully', { userId });

      return true;
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Generate OTP
   */
  async generateOTP(identifier, type, length = 6) {
    try {
      // Generate random OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Create OTP record
      const otpRecord = await OTP.create({
        [type.includes('email') ? 'email' : 'phone']: identifier,
        otp,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      logger.info('OTP generated', { identifier, type });

      return otp;
    } catch (error) {
      logger.error('OTP generation error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(identifier, otp, type) {
    try {
      const query = {
        [type.includes('email') ? 'email' : 'phone']: identifier,
        type,
        verified: false,
        expiresAt: { $gt: new Date() },
      };

      const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });

      if (!otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        throw new ApiError(400, 'Too many failed attempts. Please request a new OTP');
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new ApiError(400, 'Invalid OTP');
      }

      // Mark as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Update user verification status
      if (type === 'email_verification') {
        await User.updateOne(
          { email: identifier },
          { isEmailVerified: true }
        );
      } else if (type === 'phone_verification') {
        await User.updateOne(
          { phone: identifier },
          { isPhoneVerified: true }
        );
      }

      logger.info('OTP verified successfully', { identifier, type });

      return true;
    } catch (error) {
      logger.error('OTP verification error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isValid = await user.comparePassword(currentPassword);

      if (!isValid) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Invalidate all refresh tokens
      user.refreshTokens = [];
      await user.save();

      // Clear session cache
      await redis.delete(`session:${userId}`);

      logger.info('Password changed successfully', { userId });

      return true;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email, otp, newPassword) {
    try {
      // Verify OTP
      await this.verifyOTP(email, otp, 'password_reset');

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Update password
      user.password = newPassword;
      user.refreshTokens = [];
      await user.save();

      logger.info('Password reset successfully', { email });

      return true;
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        type: 'refresh',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
  }

  /**
   * Verify token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError(401, 'Invalid token');
    }
  }
}

module.exports = new AuthService();
