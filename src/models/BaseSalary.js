const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');


const BaseSalary = sequelize.define('BaseSalary', {
  base_sal_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'base_sal_id'
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'salary'
  },
}, {
  tableName: 'base_salary',
  timestamps: false,
  underscored: true
});

module.exports = BaseSalary;

