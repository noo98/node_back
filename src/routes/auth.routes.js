const express = require('express');
const authController = require('../controllers/auth.controller');
const positionController = require('../controllers/position.controller'); 
const { getAllPositions } = require('../controllers/position.controller');
const {  createSchedule,  
         getAllSchedules,  
         getScheduleById,  
         updateSchedule,  
         deleteSchedule} = require('../controllers/employeeSchedule.controller');
const employeeController = require('../controllers/employee.controller'); 
const attendanceController = require('../controllers/attendance.controller');  
const payrollController = require('../controllers/payroll.controller');
const specialAllowanceController = require('../controllers/specialAllowance.controller');
const roleController = require('../controllers/role.controller');
const main_menuController = require('../controllers/main.menus.controller');
const subMenuController = require('../controllers/submenu.controller');
const rolePermissionController = require('../controllers/rolePermission.controller');
const baseSalaryController = require ('../controllers/baseSalary.controller')


const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);

router.get("/users/:id", authController.getUserById);
router.put("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);
router.put("/users/", authController.searchUsers);
router.get("/users/", authController.getAllUsers
    
);
router.get('/user-menu/:userId', authController.getUserMenu);


router.post('/positions', positionController.createPosition); 
router.get('/positions', getAllPositions); 
router.get('/positions/:id', positionController.getPositionById); 
router.put('/positions/:id', positionController.updatePosition); 
router.delete('/positions/:id', positionController.deletePosition); 

router.post('/schedules', createSchedule);
router.get('/schedules', getAllSchedules);
router.get('/schedules/:id', getScheduleById);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.post('/employees', employeeController.createEmployee);
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

router.post('/attendances', attendanceController.createAttendance);
router.get('/attendances', attendanceController.getAllAttendances);
router.get('/attendances/:id', attendanceController.getAttendanceById);
router.put('/attendances/:id', attendanceController.updateAttendance);
router.delete('/attendances/:id', attendanceController.deleteAttendance);

router.post('/payrolls', payrollController.createPayroll);
router.get('/payrolls', payrollController.getAllPayrolls);
router.get('/payrolls/:id', payrollController.getPayrollById);
router.put('/payrolls/:id', payrollController.updatePayroll);
router.delete('/payrolls/:id', payrollController.deletePayroll);

router.post('/special-allowances', specialAllowanceController.createSpecialAllowance);
router.get('/special-allowances', specialAllowanceController.getAllSpecialAllowances);
router.get('/special-allowances/:id', specialAllowanceController.getSpecialAllowanceById);
router.put('/special-allowances/:id', specialAllowanceController.updateSpecialAllowance);
router.delete('/special-allowances/:id', specialAllowanceController.deleteSpecialAllowance);

router.get('/role', roleController.getAllRoles); // ເພີ່ມ route ສຳລັບ GET /api/auth/role
router.get('/role/:id', roleController.getRoleById);
router.post('/role', roleController.createRole);
router.put('/role/:id', roleController.updateRole);
router.delete('/role/:id', roleController.deleteRole);

router.post('/main_menu', main_menuController.createMainMenu); 
router.get('/main_menu', main_menuController.getAllMainMenus); 
router.get('/main_menu/:id', main_menuController.getMainMenuById); 
router.put('/main_menu/:id', main_menuController.updateMainMenu); 
router.delete('/main_menu/:id', main_menuController.deleteMainMenu); 

router.post('/sub_menus', subMenuController.createSubMenu);
router.get('/sub_menus', subMenuController.getAllSubMenus);
router.get('/sub_menus/:id', subMenuController.getSubMenuById);
router.put('/sub_menus/:id', subMenuController.updateSubMenu);
router.delete('/sub_menus/:id', subMenuController.deleteSubMenu);

router.post('/role_permissions', rolePermissionController.createRolePermission);
router.get('/role_permissions', rolePermissionController.getAllRolePermissions);
router.get('/role_permissions/:id', rolePermissionController.getRolePermissionById);
router.put('/role_permissions/:id', rolePermissionController.updateRolePermission);
router.delete('/role_permissions/:id', rolePermissionController.deleteRolePermission);

router.post('/base_salary',baseSalaryController.createBaseSalary);
router.get('/base_salary',baseSalaryController.getAllBaseSalary);
router.get('/base_salary/:id',baseSalaryController.getAllBaseSalaryById);
router.put('/base_salary/:id',baseSalaryController.updateBaseSalary);
router.delete('/base_salary/:id',baseSalaryController.deleteBaseSalary);

module.exports = router;