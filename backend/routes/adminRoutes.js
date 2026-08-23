const express = require('express');
const router = express.Router();
const {
  getDashboard,
  createUser,
  createStore,
  listStores,
  listUsers,
  getUserDetail,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { nameRule, addressRule, emailRule, passwordRule } = require('../utils/validators');
const { body } = require('express-validator');

// every route in this file requires an authenticated admin
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

router.post(
  '/users',
  [
    nameRule(),
    emailRule(),
    addressRule(),
    passwordRule(),
    body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
  ],
  validateRequest,
  createUser
);

router.post(
  '/stores',
  [nameRule(), emailRule(), addressRule()],
  validateRequest,
  createStore
);

router.get('/stores', listStores);
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);

module.exports = router;
