const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  username: {
    in: ['body'],
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Username must be between 3 and 50 characters'
    },
    matches: {
      options: /^[a-zA-Z0-9_]+$/,
      errorMessage: 'Username can only contain letters, numbers, and underscores'
    }
  },
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true
  },
  password: {
    in: ['body'],
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    }
  },
  title: {
    in: ['body'],
    isLength: {
      options: { min: 1, max: 255 },
      errorMessage: 'Title must be between 1 and 255 characters'
    },
    trim: true
  },
  content: {
    in: ['body'],
    isLength: {
      options: { min: 1 },
      errorMessage: 'Content cannot be empty'
    },
    trim: true
  },
  postId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Post ID must be a positive integer'
    }
  },
  commentId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Comment ID must be a positive integer'
    }
  },
  roomId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Room ID must be a positive integer'
    }
  },
  messageId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Message ID must be a positive integer'
    }
  }
};

module.exports = {
  validate,
  commonValidations
}; 