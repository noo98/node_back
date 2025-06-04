// src/models/UserPermission.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const User = require('./User');

const UserPermission = sequelize.define('UserPermission', {
  permission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'permission_id'
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
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'resource'  // ຕົວຢ່າງ: 'employee', 'payroll', 'report'
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'action'  // ຕົວຢ່າງ: 'create', 'read', 'update', 'delete'
  },
  is_allowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_allowed'
  }
}, {
  tableName: 'user_permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'resource', 'action']
    }
  ]
});

// ກຳນົດຄວາມສຳພັນ
UserPermission.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserPermission, { foreignKey: 'user_id' });

module.exports = UserPermission;