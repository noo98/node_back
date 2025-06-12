// src/models/Payroll.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const Employee = require('./Employee');
const SpecialAllowance = require('./SpecialAllowance');

const Payroll = sequelize.define('Payroll', {
  payroll_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'payroll_id'
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'employee_id'
  },
  special_allowance_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'special_allowance_id'
  },
  base_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_salary'
  },
  cut_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'cut_money'
  },
  net_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'net_salary'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'payment_date'
  }
}, {
  tableName: 'payroll',
  timestamps: true
});

// Define associations
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Payroll.belongsTo(SpecialAllowance, { foreignKey: 'special_allowance_id', as: 'specialAllowance' });

module.exports = Payroll;