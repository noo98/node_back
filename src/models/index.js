// src/models/index.js
const { sequelize, Sequelize } = require('../db/connection');

// ນຳເຂົ້າໂມເດວຕ່າງໆ
const EmployeeWorkSchedule = require('./EmployeeWorkSchedule');
const Position = require('./Position');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const SpecialAllowance = require('./SpecialAllowance');
const Payroll = require('./Payroll');
const MainMenu = require('./main_menu');
const SubMenu = require('./SubMenu');
const User = require('./User');
const Role = require('./Role');
const RolePermission = require('./RolePermission');
const UserSession = require('./UserSession');
const UserPermission = require('./UserPermission');
const BaseSalary = require('./BaseSalary');


// ກຳນົດຄວາມສຳພັນ
// 1. ຄວາມສຳພັນຂອງ Position
Position.hasMany(Employee, { foreignKey: 'position_id' });
Employee.belongsTo(Position, { foreignKey: 'position_id' });

MainMenu.hasMany(SubMenu, { foreignKey: 'main_id' });
SubMenu.belongsTo(MainMenu, { foreignKey: 'main_id' });

EmployeeWorkSchedule.hasMany(Employee, { foreignKey: 'schedule_id' });
Employee.belongsTo(EmployeeWorkSchedule, { foreignKey: 'schedule_id' });

User.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasOne(User, { foreignKey: 'employee_id' });

Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

// 4. ຄວາມສຳພັນຂອງ SpecialAllowance
Employee.hasMany(SpecialAllowance, { foreignKey: 'employee_id' });
SpecialAllowance.belongsTo(Employee, { foreignKey: 'employee_id' });

// 5. ຄວາມສຳພັນຂອງ Payroll
Employee.hasMany(Payroll, { foreignKey: 'employee_id' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id' });
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserPermission, { foreignKey: 'user_id' });
UserPermission.belongsTo(User, { foreignKey: 'user_id' });

Role.hasMany(RolePermission, { foreignKey: 'role_id' });
RolePermission.belongsTo(Role, { foreignKey: 'role_id' });

SubMenu.hasMany(RolePermission, { foreignKey: 'sub_id' });
RolePermission.belongsTo(SubMenu, { foreignKey: 'sub_id' });

SubMenu.belongsTo(MainMenu, { foreignKey: 'main_id' });
MainMenu.hasMany(SubMenu, { foreignKey: 'main_id' });

MainMenu.hasMany(SubMenu, { foreignKey: 'main_id', as: 'children' });
SubMenu.belongsTo(MainMenu, { foreignKey: 'main_id' });

module.exports = {
  sequelize,
  Sequelize,
  EmployeeWorkSchedule,
  Position,
  Employee,
  Attendance,
  SpecialAllowance,
  Payroll,
  User,
  UserSession,
  UserPermission,
  MainMenu,
  SubMenu,
  Role,
  RolePermission,
  BaseSalary
};