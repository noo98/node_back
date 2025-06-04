// src/models/EmployeeWorkSchedule.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

const EmployeeWorkSchedule = sequelize.define('EmployeeWorkSchedule', {
  schedule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'schedule_id'
  },
  work_shift: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'work_shift'
  },
  shift_start: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'shift_start'
  },
  shift_end: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'shift_end'
  }
}, {
  tableName: 'employee_work_schedule',
  timestamps: true
});

module.exports = EmployeeWorkSchedule; 