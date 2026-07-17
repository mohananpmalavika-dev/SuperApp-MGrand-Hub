/**
 * Authentication Controller
 */

const authService = require('../services/auth.service');
const { ApiResponse, asyncHandler } = require('@mgrand-hub/shared');

class AuthController {
  /**
   * Register new user
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    
    res.status(201).json(
      new ApiResponse(201, result, 'User registered successfully')
    );
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.json(
      new ApiResponse(200, result, 'Login successful')
    );
  });

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.json(
      new ApiResponse(200, result, 'Token refreshed successfully')
    );
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(req.user.userId, refreshToken);
    
    res.json(
      new ApiResponse(200, null, 'Logout successful')
    );
  });

  /**
   * Send OTP
   */
  sendOTP = asyncHandler(async (req, res) => {
    const { identifier, type } = req.body;
    const otp = await authService.generateOTP(identifier, type);
    
    res.json(
      new ApiResponse(200, 
        process.env.NODE_ENV === 'development' ? { otp } : null,
        'OTP sent successfully'
      )
    );
  });

  /**
   * Verify OTP
   */
  verifyOTP = asyncHandler(async (req, res) => {
    const { identifier, otp, type } = req.body;
    await authService.verifyOTP(identifier, otp, type);
    
    res.json(
      new ApiResponse(200, null, 'OTP verified successfully')
    );
  });

  /**
   * Change password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    
    res.json(
      new ApiResponse(200, null, 'Password changed successfully')
    );
  });

  /**
   * Request password reset
   */
  requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const otp = await authService.generateOTP(email, 'password_reset');
    
    res.json(
      new ApiResponse(200,
        process.env.NODE_ENV === 'development' ? { otp } : null,
        'Password reset OTP sent to your email'
      )
    );
  });

  /**
   * Reset password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    
    res.json(
      new ApiResponse(200, null, 'Password reset successfully')
    );
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    
    res.json(
      new ApiResponse(200, { user }, 'Profile retrieved successfully')
    );
  });

  /**
   * Verify token
   */
  verifyToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const decoded = authService.verifyToken(token);
    
    res.json(
      new ApiResponse(200, { decoded, valid: true }, 'Token is valid')
    );
  });
}

module.exports = new AuthController();
