/**
 * User Controller
 */

const userService = require('../services/user.service');
const { ApiResponse, asyncHandler } = require('@mgrand-hub/shared');

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.user.userId);
    res.json(new ApiResponse(200, { profile }, 'Profile retrieved successfully'));
  });

  updateProfile = asyncHandler(async (req, res) => {
    const profile = await userService.updateProfile(req.user.userId, req.body);
    res.json(new ApiResponse(200, { profile }, 'Profile updated successfully'));
  });

  addAddress = asyncHandler(async (req, res) => {
    const profile = await userService.addAddress(req.user.userId, req.body);
    res.json(new ApiResponse(200, { profile }, 'Address added successfully'));
  });

  updateAddress = asyncHandler(async (req, res) => {
    const profile = await userService.updateAddress(req.user.userId, req.params.addressId, req.body);
    res.json(new ApiResponse(200, { profile }, 'Address updated successfully'));
  });

  deleteAddress = asyncHandler(async (req, res) => {
    const profile = await userService.deleteAddress(req.user.userId, req.params.addressId);
    res.json(new ApiResponse(200, { profile }, 'Address deleted successfully'));
  });

  updatePreferences = asyncHandler(async (req, res) => {
    const profile = await userService.updatePreferences(req.user.userId, req.body);
    res.json(new ApiResponse(200, { profile }, 'Preferences updated successfully'));
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    const profile = await userService.uploadAvatar(req.user.userId, req.file);
    res.json(new ApiResponse(200, { profile }, 'Avatar uploaded successfully'));
  });

  searchUsers = asyncHandler(async (req, res) => {
    const result = await userService.searchUsers(req.query.q, req.query);
    res.json(new ApiResponse(200, result, 'Users retrieved successfully'));
  });
}

module.exports = new UserController();
