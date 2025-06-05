// src/models/Attendance.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  attendance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'attendance_id'
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employee_id'
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'check_in_time'
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'check_out_time'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date'
  }
}, {
  tableName: 'attendance',
  timestamps: true
});

Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
module.exports = Attendance;