/**
 * Event Bus for Inter-Service Communication
 * Uses Redis Pub/Sub for distributed events
 */

const redis = require('../redis');
const logger = require('../logger');

class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  async publish(event, data) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME || 'unknown',
      };

      await redis.publish(event, payload);
      logger.info(`Event published: ${event}`, { event, data });
    } catch (error) {
      logger.error(`Failed to publish event: ${event}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} handler - Event handler function
   */
  async subscribe(event, handler) {
    try {
      // Store handler
      if (!this.handlers.has(event)) {
        this.handlers.set(event, []);
      }
      this.handlers.get(event).push(handler);

      // Subscribe to Redis channel
      await redis.subscribe(event, async (payload) => {
        try {
          const handlers = this.handlers.get(event) || [];
          for (const h of handlers) {
            await h(payload.data, payload);
          }
        } catch (error) {
          logger.error(`Error handling event: ${event}`, error);
        }
      });

      logger.info(`Subscribed to event: ${event}`);
    } catch (error) {
      logger.error(`Failed to subscribe to event: ${event}`, error);
      throw error;
    }
  }
}

module.exports = {
  EventBus: new EventBus(),
};
