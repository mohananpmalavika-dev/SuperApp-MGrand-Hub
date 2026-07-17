/**
 * User Service - Core Business Logic
 */

const UserProfile = require('../models/UserProfile.model');
const { logger, redis, ApiError, ServiceClient } = require('@mgrand-hub/shared');

class UserService {
  constructor() {
    // Initialize auth service client
    this.authService = new ServiceClient(
      process.env.AUTH_SERVICE_URL,
      'auth-service'
    );
  }

  /**
   * Get or create user profile
   */
  async getOrCreateProfile(userId) {
    try {
      let profile = await UserProfile.findOne({ userId });

      if (!profile) {
        profile = await UserProfile.create({ userId });
        logger.info('Profile created', { userId });
      }

      return profile;
    } catch (error) {
      logger.error('Get/create profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { ...updateData, lastUpdated: new Date() },
        { new: true, upsert: true }
      );

      // Check if profile is complete
      profile.isProfileComplete = this.isProfileComplete(profile);
      await profile.save();

      logger.info('Profile updated', { userId });

      // Cache profile
      await redis.set(`profile:${userId}`, profile, 3600); // 1 hour

      return profile;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      // Try cache first
      const cached = await redis.get(`profile:${userId}`);
      if (cached) return cached;

      const profile = await UserProfile.findOne({ userId });

      if (!profile) {
        throw new ApiError(404, 'Profile not found');
      }

      // Cache it
      await redis.set(`profile:${userId}`, profile, 3600);

      return profile;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Add address
   */
  async addAddress(userId, addressData) {
    try {
      const profile = await this.getOrCreateProfile(userId);

      // If this is set as default, unset others
      if (addressData.isDefault) {
        profile.addresses.forEach(addr => addr.isDefault = false);
      }

      profile.addresses.push(addressData);
      await profile.save();

      // Invalidate cache
      await redis.delete(`profile:${userId}`);

      logger.info('Address added', { userId });

      return profile;
    } catch (error) {
      logger.error('Add address error:', error);
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(userId, addressId, addressData) {
    try {
      const profile = await UserProfile.findOne({ userId });

      if (!profile) {
        throw new ApiError(404, 'Profile not found');
      }

      const address = profile.addresses.id(addressId);

      if (!address) {
        throw new ApiError(404, 'Address not found');
      }

      // If setting as default, unset others
      if (addressData.isDefault) {
        profile.addresses.forEach(addr => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      Object.assign(address, addressData);
      await profile.save();

      // Invalidate cache
      await redis.delete(`profile:${userId}`);

      logger.info('Address updated', { userId, addressId });

      return profile;
    } catch (error) {
      logger.error('Update address error:', error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(userId, addressId) {
    try {
      const profile = await UserProfile.findOne({ userId });

      if (!profile) {
        throw new ApiError(404, 'Profile not found');
      }

      profile.addresses.pull(addressId);
      await profile.save();

      // Invalidate cache
      await redis.delete(`profile:${userId}`);

      logger.info('Address deleted', { userId, addressId });

      return profile;
    } catch (error) {
      logger.error('Delete address error:', error);
      throw error;
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { preferences, lastUpdated: new Date() },
        { new: true, upsert: true }
      );

      // Invalidate cache
      await redis.delete(`profile:${userId}`);

      logger.info('Preferences updated', { userId });

      return profile;
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId, file) {
    try {
      // In production, upload to S3/Cloud Storage
      // For now, store file path
      const avatarUrl = `/uploads/avatars/${userId}-${Date.now()}.jpg`;

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { avatar: avatarUrl, lastUpdated: new Date() },
        { new: true, upsert: true }
      );

      // Invalidate cache
      await redis.delete(`profile:${userId}`);

      logger.info('Avatar uploaded', { userId, avatarUrl });

      return profile;
    } catch (error) {
      logger.error('Upload avatar error:', error);
      throw error;
    }
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(profile) {
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.phone &&
      profile.dateOfBirth &&
      profile.addresses.length > 0
    );
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(query, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;

      const searchQuery = {
        $or: [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
          { displayName: new RegExp(query, 'i') },
          { phone: new RegExp(query, 'i') },
        ],
      };

      const profiles = await UserProfile.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await UserProfile.countDocuments(searchQuery);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
