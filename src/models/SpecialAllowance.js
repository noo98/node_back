// src/models/SpecialAllowance.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const Employee = require('./Employee');

const SpecialAllowance = sequelize.define('SpecialAllowance', {
  special_allowance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'special_allowance_id'
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    field: 'employee_id'
    // ການອ້າງອີງຈະຖືກກຳນົດຫຼັງຈາກສ້າງໂມເດວ Employee
  },
  bonus_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'bonus_money'
  },
    tigh_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'tigh_money'
  },
  food_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'food_money'
  },
  ot: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'ot'
  }
}, {
  tableName: 'special_allowance',
  timestamps: true
});

SpecialAllowance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
module.exports = SpecialAllowance;