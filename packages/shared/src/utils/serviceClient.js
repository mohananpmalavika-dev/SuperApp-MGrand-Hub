/**
 * Service Client for Inter-Service HTTP Communication
 */

const axios = require('axios');
const logger = require('../logger');

class ServiceClient {
  constructor(baseURL, serviceName) {
    this.baseURL = baseURL;
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': process.env.SERVICE_API_KEY,
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Service call: ${serviceName} ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`Service request error: ${serviceName}`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        logger.error(`Service response error: ${serviceName}`, {
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get(endpoint, config = {}) {
    try {
      const response = await this.client.get(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data, config = {}) {
    try {
      const response = await this.client.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data, config = {}) {
    try {
      const response = await this.client.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, config = {}) {
    try {
      const response = await this.client.delete(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    if (error.response) {
      throw new Error(`${this.serviceName} service error: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      throw new Error(`${this.serviceName} service unavailable`);
    } else {
      throw new Error(`${this.serviceName} service call failed: ${error.message}`);
    }
  }
}

module.exports = {
  ServiceClient,
};
