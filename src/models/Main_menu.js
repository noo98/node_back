const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

  const MainMenu = sequelize.define('MainMenu', {
    main_id: {
      type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'main_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    actions: {
    type: DataTypes.TEXT,
    allowNull: true 
   },
    created_at: {
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'main_menus',
    timestamps: false, 
    underscored: true
  });
const SupMenu = require('./SubMenu');
MainMenu.hasMany(SupMenu, { foreignKey: 'main_id' });

module.exports = MainMenu

