const express = require('express');
const router = express.Router();
const { signup, login, updatePassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { nameRule, addressRule, emailRule, passwordRule } = require('../utils/validators');
const { body } = require('express-validator');

router.post(
  '/signup',
  [nameRule(), emailRule(), addressRule(), passwordRule()],
  validateRequest,
  signup
);

router.post(
  '/login',
  [emailRule(), body('password').notEmpty().withMessage('Password is required')],
  validateRequest,
  login
);

router.put(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordRule('newPassword'),
  ],
  validateRequest,
  updatePassword
);

router.get('/me', protect, getMe);

module.exports = router;
