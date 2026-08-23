const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

// @route GET /api/store-owner/dashboard
const getDashboard = async (req, res) => {
  try {
    // console.log(req.user.id);
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet' });
    }

    const ratings = await Rating.findAll({
      where: { store_id: store.id },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    
    });

    const avgResult = await Rating.findOne({
      where: { store_id: store.id },
      attributes: [[fn('ROUND', fn('AVG', col('rating')), 2), 'averageRating']],
      raw: true,
    });

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating: avgResult ? avgResult.averageRating : null,
      raters: ratings.map((r) => ({
        userId: r.User.id,
        name: r.User.name,
        email: r.User.email,
        rating: r.rating,
        // ratedAt: r.created_at,
      })),
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

module.exports = { getDashboard };
