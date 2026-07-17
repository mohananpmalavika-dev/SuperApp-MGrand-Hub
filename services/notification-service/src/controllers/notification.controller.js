/**
 * Notification Controller
 */

const notificationService = require('../services/notification.service');
const { ApiResponse, asyncHandler } = require('@mgrand-hub/shared');

class NotificationController {
  /**
   * Send email
   */
  sendEmail = asyncHandler(async (req, res) => {
    const notification = await notificationService.sendEmail(
      req.user.userId,
      req.body
    );
    
    res.status(201).json(
      new ApiResponse(201, { notification }, 'Email sent successfully')
    );
  });

  /**
   * Send SMS
   */
  sendSMS = asyncHandler(async (req, res) => {
    const notification = await notificationService.sendSMS(
      req.user.userId,
      req.body
    );
    
    res.status(201).json(
      new ApiResponse(201, { notification }, 'SMS sent successfully')
    );
  });

  /**
   * Send push notification
   */
  sendPush = asyncHandler(async (req, res) => {
    const notification = await notificationService.sendPush(
      req.user.userId,
      req.body
    );
    
    res.status(201).json(
      new ApiResponse(201, { notification }, 'Push notification sent')
    );
  });

  /**
   * Get user notifications
   */
  getUserNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getUserNotifications(
      req.user.userId,
      req.query
    );
    
    res.json(
      new ApiResponse(200, result, 'Notifications retrieved successfully')
    );
  });

  /**
   * Mark as read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.userId
    );
    
    res.json(
      new ApiResponse(200, { notification }, 'Notification marked as read')
    );
  });

  /**
   * Save template
   */
  saveTemplate = asyncHandler(async (req, res) => {
    const template = await notificationService.saveTemplate(req.body);
    
    res.json(
      new ApiResponse(200, { template }, 'Template saved successfully')
    );
  });

  /**
   * Get templates
   */
  getTemplates = asyncHandler(async (req, res) => {
    const templates = await notificationService.getTemplates(req.query);
    
    res.json(
      new ApiResponse(200, { templates }, 'Templates retrieved successfully')
    );
  });
}

module.exports = new NotificationController();
