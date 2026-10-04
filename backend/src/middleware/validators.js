const Joi = require('joi');

/**
 * Validate shop registration data
 */
const validateShopRegistration = (req, res, next) => {
  const schema = Joi.object({
    shop_name: Joi.string().min(3).max(255).required()
      .messages({
        'string.empty': 'Shop name is required',
        'string.min': 'Shop name must be at least 3 characters',
        'string.max': 'Shop name cannot exceed 255 characters'
      }),
    
    shop_owner_name: Joi.string().min(3).max(255).required()
      .messages({
        'string.empty': 'Shop owner name is required',
        'string.min': 'Owner name must be at least 3 characters'
      }),
    
    shop_number: Joi.string().pattern(/^[0-9]{10,15}$/).required()
      .messages({
        'string.empty': 'Shop number is required',
        'string.pattern.base': 'Shop number must be 10-15 digits'
      }),
    
    shop_address: Joi.string().min(10).max(500).required()
      .messages({
        'string.empty': 'Shop address is required',
        'string.min': 'Address must be at least 10 characters'
      }),
    
    shop_gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().allow('', null)
      .messages({
        'string.pattern.base': 'Invalid GSTIN format (e.g., 27AABCU9603R1ZM)'
      }),
    
    shop_userid: Joi.string().min(3).max(50).alphanum().required()
      .messages({
        'string.empty': 'User ID is required',
        'string.min': 'User ID must be at least 3 characters',
        'string.alphanum': 'User ID must contain only letters and numbers'
      }),
    
    shop_passcode: Joi.string().pattern(/^[0-9]{4,6}$/).required()
      .messages({
        'string.empty': 'Passcode is required',
        'string.pattern.base': 'Passcode must be 4-6 digits'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Validate shop login data
 */
const validateShopLogin = (req, res, next) => {
  const schema = Joi.object({
    shop_userid: Joi.string().required()
      .messages({
        'string.empty': 'User ID is required'
      }),
    
    shop_passcode: Joi.string().pattern(/^[0-9]{4,6}$/).required()
      .messages({
        'string.empty': 'Passcode is required',
        'string.pattern.base': 'Passcode must be 4-6 digits'
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateShopRegistration,
  validateShopLogin
};
