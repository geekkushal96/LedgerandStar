const express = require('express');
const router = express.Router();
const { listStoresForUser, submitRating } = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { ratingRule } = require('../utils/validators');

router.use(protect, authorize('user'));

router.get('/', listStoresForUser);
router.post('/:id/rating', [ratingRule()], validateRequest, submitRating);

module.exports = router;
