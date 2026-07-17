/**
 * Notification Service - Core Business Logic
 */

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Handlebars = require('handlebars');
const Notification = require('../models/Notification.model');
const Template = require('../models/Template.model');
const { logger, redis, ApiError, EventBus } = require('@mgrand-hub/shared');

class NotificationService {
  constructor() {
    // Initialize Email (Nodemailer)
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // Subscribe to events
    this.subscribeToEvents();
  }

  /**
   * Subscribe to application events
   */
  async subscribeToEvents() {
    // User registered
    await EventBus.subscribe('user.registered', async (data) => {
      await this.sendWelcomeEmail(data.email, data.name);
    });

    // Payment completed
    await EventBus.subscribe('payment.completed', async (data) => {
      await this.sendPaymentConfirmation(data.userId, data);
    });

    // Order created
    await EventBus.subscribe('order.created', async (data) => {
      await this.sendOrderConfirmation(data.userId, data);
    });
  }

  /**
   * Send email notification
   */
  async sendEmail(userId, emailData) {
    try {
      const { to, subject, content, templateId, templateData } = emailData;

      let emailContent = content;

      // Use template if provided
      if (templateId) {
        const template = await Template.findOne({ name: templateId, type: 'email' });
        if (template) {
          const compiled = Handlebars.compile(template.content);
          emailContent = compiled(templateData || {});
        }
      }

      // Send email
      const info = await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@mgrandhub.com',
        to,
        subject,
        html: emailContent,
      });

      // Create notification record
      const notification = await Notification.create({
        userId,
        type: 'email',
        channel: 'smtp',
        recipient: to,
        subject,
        content: emailContent,
        templateId,
        templateData,
        status: 'sent',
        sentAt: new Date(),
      });

      logger.info('Email sent successfully', { userId, to, messageId: info.messageId });

      return notification;
    } catch (error) {
      logger.error('Send email error:', error);
      
      // Create failed notification record
      await Notification.create({
        userId,
        type: 'email',
        channel: 'smtp',
        recipient: emailData.to,
        subject: emailData.subject,
        content: emailData.content,
        status: 'failed',
        errorMessage: error.message,
      });

      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(userId, smsData) {
    try {
      const { to, content } = smsData;

      if (!this.twilioClient) {
        throw new ApiError(500, 'Twilio not configured');
      }

      // Send SMS
      const message = await this.twilioClient.messages.create({
        body: content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      // Create notification record
      const notification = await Notification.create({
        userId,
        type: 'sms',
        channel: 'twilio',
        recipient: to,
        content,
        status: 'sent',
        sentAt: new Date(),
        metadata: { sid: message.sid },
      });

      logger.info('SMS sent successfully', { userId, to, sid: message.sid });

      return notification;
    } catch (error) {
      logger.error('Send SMS error:', error);
      
      // Create failed notification record
      await Notification.create({
        userId,
        type: 'sms',
        channel: 'twilio',
        recipient: smsData.to,
        content: smsData.content,
        status: 'failed',
        errorMessage: error.message,
      });

      throw error;
    }
  }

  /**
   * Send push notification (Firebase)
   */
  async sendPush(userId, pushData) {
    try {
      const { token, title, body, data } = pushData;

      // Note: Firebase Admin SDK initialization should be done in server.js
      // This is a placeholder for the actual implementation
      
      const notification = await Notification.create({
        userId,
        type: 'push',
        channel: 'firebase',
        recipient: token,
        subject: title,
        content: body,
        status: 'sent',
        sentAt: new Date(),
        metadata: data,
      });

      logger.info('Push notification sent', { userId, token });

      return notification;
    } catch (error) {
      logger.error('Send push error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const { type, status, page = 1, limit = 20 } = filters;

      const query = { userId };
      if (type) query.type = type;
      if (status) query.status = status;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { status: 'read', readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new ApiError(404, 'Notification not found');
      }

      return notification;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    try {
      await this.sendEmail(null, {
        to: email,
        subject: 'Welcome to MGrand Hub!',
        content: `<h1>Welcome ${name}!</h1><p>Thank you for joining MGrand Hub.</p>`,
      });
    } catch (error) {
      logger.error('Send welcome email error:', error);
    }
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(userId, paymentData) {
    try {
      // Get user email (would call user service)
      logger.info('Sending payment confirmation', { userId, ...paymentData });
      // Implementation here
    } catch (error) {
      logger.error('Send payment confirmation error:', error);
    }
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(userId, orderData) {
    try {
      logger.info('Sending order confirmation', { userId, ...orderData });
      // Implementation here
    } catch (error) {
      logger.error('Send order confirmation error:', error);
    }
  }

  /**
   * Create or update template
   */
  async saveTemplate(templateData) {
    try {
      const { name, type, subject, content, variables, description } = templateData;

      const template = await Template.findOneAndUpdate(
        { name },
        { type, subject, content, variables, description },
        { new: true, upsert: true }
      );

      logger.info('Template saved', { name, type });

      return template;
    } catch (error) {
      logger.error('Save template error:', error);
      throw error;
    }
  }

  /**
   * Get templates
   */
  async getTemplates(filters = {}) {
    try {
      const { type, isActive = true } = filters;

      const query = { isActive };
      if (type) query.type = type;

      const templates = await Template.find(query);

      return templates;
    } catch (error) {
      logger.error('Get templates error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
