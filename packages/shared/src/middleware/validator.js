/**
 * Request Validation Middleware using Joi
 */

const Joi = require('joi');
const { ApiError } = require('../utils/apiResponse');

/**
 * Validate request using Joi schema
 * @param {object} schema - Joi validation schema { body, query, params }
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys
      stripUnknown: true, // Remove unknown keys
    };

    const toValidate = {};
    
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    const { error, value } = Joi.object(schema).validate(toValidate, validationOptions);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new ApiError(400, errorMessage));
    }

    // Replace request with validated values
    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;

    next();
  };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  // MongoDB ObjectId
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId'),
  
  // Email
  email: Joi.string().email().lowercase().trim(),
  
  // Password (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'),
  
  // Phone number
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone must be 10 digits'),
  
  // Pagination
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  
  // Date
  date: Joi.date().iso(),
  
  // URL
  url: Joi.string().uri(),
};

module.exports = {
  validate,
  commonSchemas,
  Joi, // Export Joi for custom schemas
};
