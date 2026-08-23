const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// A store optionally belongs to one owner (User with role store_owner)
Store.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
User.hasOne(Store, { as: 'store', foreignKey: 'owner_id' });

// A user can submit many ratings; a store can receive many ratings
User.hasMany(Rating, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id' });

Store.hasMany(Rating, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = { sequelize, User, Store, Rating };
