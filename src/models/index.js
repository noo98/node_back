// src/models/index.js
const fs = require('fs');
const path = require('path');
const { sequelize, Sequelize } = require('../db/connection');
const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ກຳນົດຄວາມສຳພັນດ້ວຍຕົວປ່ຽນ db
db.Position.hasMany(db.Employee, { foreignKey: 'position_id' });
db.Employee.belongsTo(db.Position, { foreignKey: 'position_id' });

db.MainMenu.hasMany(db.SubMenu, { foreignKey: 'main_id', as: 'children' });
db.SubMenu.belongsTo(db.MainMenu, { foreignKey: 'main_id' });

db.EmployeeWorkSchedule.hasMany(db.Employee, { foreignKey: 'schedule_id' });
db.Employee.belongsTo(db.EmployeeWorkSchedule, { foreignKey: 'schedule_id' });

db.Employee.hasOne(db.User, { foreignKey: 'employee_id' });
db.User.belongsTo(db.Employee, { foreignKey: 'employee_id' });

db.Employee.hasMany(db.Attendance, { foreignKey: 'employee_id' });
db.Attendance.belongsTo(db.Employee, { foreignKey: 'employee_id' });

db.Employee.hasMany(db.SpecialAllowance, { foreignKey: 'employee_id', as: 'specialAllowances' }); // ກຳນົດ alias
db.SpecialAllowance.belongsTo(db.Employee, { foreignKey: 'employee_id' });

db.Employee.hasMany(db.Payroll, { foreignKey: 'employee_id' });
db.Payroll.belongsTo(db.Employee, { foreignKey: 'employee_id' });

db.User.hasMany(db.UserSession, { foreignKey: 'user_id' });
db.UserSession.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasMany(db.UserPermission, { foreignKey: 'user_id' });
db.UserPermission.belongsTo(db.User, { foreignKey: 'user_id' });

db.Role.hasMany(db.RolePermission, { foreignKey: 'role_id' });
db.RolePermission.belongsTo(db.Role, { foreignKey: 'role_id' });

db.SubMenu.hasMany(db.RolePermission, { foreignKey: 'sub_id' });
db.RolePermission.belongsTo(db.SubMenu, { foreignKey: 'sub_id' });

db.Position.belongsTo(db.BaseSalary, { foreignKey: 'base_sal_id', as: 'baseSalary' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;