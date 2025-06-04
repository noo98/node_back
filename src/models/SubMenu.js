const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');


const SubMenu = sequelize.define('SubMenu', {
  sub_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'sub_id'
  },
  main_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  actions: {
    type: DataTypes.TEXT,
    allowNull: true 
  },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
}, {
  tableName: 'sub_menus',
  timestamps: false,
  underscored: true
});




module.exports = SubMenu;
