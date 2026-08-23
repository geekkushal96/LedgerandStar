const { Op, fn, col } = require('sequelize');
const { Store, Rating } = require('../models');

// @route GET /api/stores?name=&address=
// Normal user's store listing: shows overall rating and the current
// user's own submitted rating (if any).
const listStoresForUser = async (req, res) => {
  try {
    const { name, address } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('ROUND', fn('AVG', col('Ratings.rating')), 2), 'overallRating']],
      },
      include: [{ model: Rating, attributes: [] }],
      group: ['Store.id'],
      order: [['name', 'ASC']],
      subQuery: false,
    });

    const userRatings = await Rating.findAll({
      where: { user_id: req.user.id },
      attributes: ['store_id', 'rating'],
      raw: true,
    });
    const ratingMap = Object.fromEntries(userRatings.map((r) => [r.store_id, r.rating]));

    const result = stores.map((s) => {
      const plain = s.toJSON();
      return { ...plain, userRating: ratingMap[s.id] || null };
    });

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};

// @route POST /api/stores/:id/rating  (upsert: submit or modify)
const submitRating = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { rating } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const [record, created] = await Rating.findOrCreate({
      where: { user_id: req.user.id, store_id: storeId },
      defaults: { rating },
    });

    if (!created) {
      record.rating = rating;
      await record.save();
    }

    res.status(created ? 201 : 200).json({
      message: created ? 'Rating submitted' : 'Rating updated',
      rating: record,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
};

module.exports = { listStoresForUser, submitRating };
