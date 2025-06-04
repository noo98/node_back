// src/models/Role.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

const Role = sequelize.define("Role", {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'role',
  timestamps: false
});

module.exports = Role;