const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

// @route GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

// @route POST /api/admin/users
// Admin can create users of any role (admin, user, store_owner).
// If role is store_owner, an optional store_id may be supplied to link
// them to an existing store.
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role, storeId } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      address,
      password: hashedPassword,
      role: role || 'user',
    });

    if (role === 'store_owner' && storeId) {
      await Store.update({ owner_id: user.id }, { where: { id: storeId } });
    }

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// @route POST /api/admin/stores
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A store with this email already exists' });
    }

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'ownerId must reference an existing store_owner user' });
      }
    }

    const store = await Store.create({ name, email, address, owner_id: ownerId || null });
    res.status(201).json({ store });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create store', error: err.message });
  }
};

const sortOrder = (sortBy, allowedFields, defaultField = 'name') => {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return field;
};

// @route GET /api/admin/stores?name=&email=&address=&sortBy=&order=
const listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, order } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const field = sortOrder(sortBy, ['name', 'email', 'address', 'created_at']);
    const direction = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('ROUND', fn('AVG', col('Ratings.rating')), 2), 'averageRating']],
      },
      include: [{ model: Rating, attributes: [] }],
      group: ['Store.id'],
      order: [[field, direction]],
      subQuery: false,
    });

    res.json({ stores });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};

// @route GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
const listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const field = sortOrder(sortBy, ['name', 'email', 'address', 'role', 'created_at']);
    const direction = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[field, direction]],
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// @route GET /api/admin/users/:id
// If the user is a store_owner, include their store's average rating.
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Store, as: 'store' }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    let rating = null;
    if (user.role === 'store_owner' && user.store) {
      const result = await Rating.findOne({
        where: { store_id: user.store.id },
        attributes: [[fn('ROUND', fn('AVG', col('rating')), 2), 'averageRating']],
        raw: true,
      });
      rating = result ? result.averageRating : null;
    }

    res.json({ user, rating });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

module.exports = { getDashboard, createUser, createStore, listStores, listUsers, getUserDetail };
