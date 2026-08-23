const { body, query } = require('express-validator');

// Name: 20-60 chars
const nameRule = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage(`${field} must be between 20 and 60 characters`);

// Address: max 400 chars
const addressRule = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage(`${field} must be between 1 and 400 characters`);

// Email: standard rules
const emailRule = (field = 'email') =>
  body(field)
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail();

// Password: 8-16 chars, at least 1 uppercase + 1 special character
const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/)
    .withMessage('Password must contain at least one special character');

const ratingRule = () =>
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5');

module.exports = { nameRule, addressRule, emailRule, passwordRule, ratingRule };
