// src/models/Payroll.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const Employee = require('./Employee');

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
    field: 'employee_id'
    // ການອ້າງອີງຈະຖືກກຳນົດຫຼັງຈາກສ້າງໂມເດວ Employee
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  social_date: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'social_date'
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'tax'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'payment_date'
  },
  base_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_salary'
  },
  hard_work_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'hard_work_money'
  }
}, {
  tableName: 'payroll',
  timestamps: true
});

Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
module.exports = Payroll;