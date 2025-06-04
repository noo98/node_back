// src/models/UserSession.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const User = require('./User');

const UserSession = sequelize.define('UserSession', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'session_id'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'user_id'
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'token'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ip_address'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  is_valid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_valid'
  }
}, {
  tableName: 'user_sessions',
  timestamps: true
});

// ກຳນົດຄວາມສຳພັນ
UserSession.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserSession, { foreignKey: 'user_id' });

module.exports = UserSession;