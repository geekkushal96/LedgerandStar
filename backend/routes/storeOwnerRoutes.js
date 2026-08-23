const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/storeOwnerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('store_owner'));

router.get('/dashboard', getDashboard);

module.exports = router;
