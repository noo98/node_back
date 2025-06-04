// force-sync.js
const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');


// ຂໍ້ມູນການເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
const dbConfig = {
  host: 'localhost',
  database: 'BOD',
  user: 'postgres',
  port: '5432',
  password: 'noo120998'
};

// ສ້າງອິນສະຕັນຂອງ Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: console.log
  }
);

// ສ້າງໂມເດວ EmployeeWorkSchedule
const EmployeeWorkSchedule = sequelize.define('EmployeeWorkSchedule', {
  schedule_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'schedule_id'
  },
  shift_start: {
    type: Sequelize.TIME,
    allowNull: false,
    field: 'shift_start'
  },
  shift_end: {
    type: Sequelize.TIME,
    allowNull: false,
    field: 'shift_end'
  }
}, {
  tableName: 'employee_work_schedule',
  timestamps: true
});

// ສ້າງໂມເດວ Position
const Position = sequelize.define('Position', {
  position_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'position_id'
  },
  position_name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    field: 'position_name'
  },
  salary_rate: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'salary_rate'
  },
  ot_rate: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'ot_rate'
  }
}, {
  tableName: 'position',
  timestamps: true
});

// ສ້າງໂມເດວ Employee
const Employee = sequelize.define('Employee', {
  employee_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'employee_id'
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    field: 'name'
  },
  gender: {
    type: Sequelize.STRING(10),
    allowNull: false,
    field: 'gender'
  },
  birthdate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    field: 'birthdate'
  },
  address: {
    type: Sequelize.TEXT,
    allowNull: true,
    field: 'address'
  },
  phone: {
    type: Sequelize.STRING(15),
    allowNull: true,
    field: 'phone'
  },
  schedule_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'schedule_id'
  },
  position_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'position_id'
  }
}, {
  tableName: 'employee',
  timestamps: true
});

// ສ້າງໂມເດວ Attendance
const Attendance = sequelize.define('Attendance', {
  attendance_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'attendance_id'
  },
  employee_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'employee_id'
  },
  check_in_time: {
    type: Sequelize.TIME,
    allowNull: true,
    field: 'check_in_time'
  },
  check_out_time: {
    type: Sequelize.TIME,
    allowNull: true,
    field: 'check_out_time'
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    field: 'date'
  },
  status: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    field: 'status'
  }
}, {
  tableName: 'attendance',
  timestamps: true
});

// ສ້າງໂມເດວ SpecialAllowance
const SpecialAllowance = sequelize.define('SpecialAllowance', {
  special_allowance_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'special_allowance_id'
  },
  employee_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'employee_id'
  },
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  food_money: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'food_money'
  }
}, {
  tableName: 'special_allowance',
  timestamps: true
});

// ສ້າງໂມເດວ Payroll
const Payroll = sequelize.define('Payroll', {
  payroll_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'payroll_id'
  },
  employee_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'employee_id'
  },
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  social_date: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    field: 'social_date'
  },
  tax: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'tax'
  },
  payment_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    field: 'payment_date'
  },
  base_salary: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_salary'
  },
  hard_work_money: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    field: 'hard_work_money'
  }
}, {
  tableName: 'payroll',
  timestamps: true
});

// ສ້າງໂມເດວ Role
const Role = sequelize.define('Role', {
  role_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'role_id'
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
    field: 'name'
  },
  description: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'description'
  }
}, {
  tableName: 'role',
  timestamps: false
});


// ====== ເພີ່ມໂມເດວໃໝ່ ======

// ສ້າງໂມເດວ User
const User = sequelize.define('User', {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'user_id'
  },
  username: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
    field: 'username'
  },
  password: {
    type: Sequelize.STRING(100),
    allowNull: false,
    field: 'password'
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: true,
    unique: true,
    field: 'email'
  },
  full_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
    field: 'full_name'
  },
  role_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    field: 'role_id'
    },

  employee_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    field: 'employee_id'
  },
  last_login: {
    type: Sequelize.DATE,
    allowNull: true,
    field: 'last_login'
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'status'  // true = active, false = inactive
  },
  profile_image: {
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'profile_image'
  },

}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// ສ້າງໂມເດວ UserSession
const UserSession = sequelize.define('UserSession', {
  session_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'session_id'
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  token: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'token'
  },
  ip_address: {
    type: Sequelize.STRING(50),
    allowNull: true,
    field: 'ip_address'
  },
  user_agent: {
    type: Sequelize.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  expires_at: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  is_valid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_valid'
  }
}, {
  tableName: 'user_sessions',
  timestamps: true
});

// ສ້າງໂມເດວ UserPermission
const UserPermission = sequelize.define('UserPermission', {
  permission_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'permission_id'
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  resource: {
    type: Sequelize.STRING(50),
    allowNull: false,
    field: 'resource'  // ຕົວຢ່າງ: 'employee', 'payroll', 'report'
  },
  action: {
    type: Sequelize.STRING(20),
    allowNull: false,
    field: 'action'  // ຕົວຢ່າງ: 'create', 'read', 'update', 'delete'
  },
  is_allowed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_allowed'
  }
}, {
  tableName: 'user_permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'resource', 'action']
    }
  ]
});

// ກຳນົດຄວາມສຳພັນລະຫວ່າງຕາຕະລາງ
// 1. Employee - Position
Employee.belongsTo(Position, { foreignKey: 'position_id' });
Position.hasMany(Employee, { foreignKey: 'position_id' });

// 2. Employee - EmployeeWorkSchedule
Employee.belongsTo(EmployeeWorkSchedule, { foreignKey: 'schedule_id' });
EmployeeWorkSchedule.hasMany(Employee, { foreignKey: 'schedule_id' });

// 3. Employee - Attendance
Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

// 4. Employee - SpecialAllowance
Employee.hasMany(SpecialAllowance, { foreignKey: 'employee_id' });
SpecialAllowance.belongsTo(Employee, { foreignKey: 'employee_id' });

// 5. Employee - Payroll
Employee.hasMany(Payroll, { foreignKey: 'employee_id' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id' });

// ====== ຄວາມສຳພັນໃໝ່ ======
// 6. User - Employee
User.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasOne(User, { foreignKey: 'employee_id' });

// 7. User - UserSession
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

// 8. User - UserPermission
User.hasMany(UserPermission, { foreignKey: 'user_id' });
UserPermission.belongsTo(User, { foreignKey: 'user_id' });

// Role - User
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

async function forceSync() {
  try {
    console.log('ກຳລັງພະຍາຍາມເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນ...');
    await sequelize.authenticate();
    console.log('ການເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນສຳເລັດແລ້ວ!');
    
    console.log('ກຳລັງສ້າງຕາຕະລາງທັງໝົດ...');
    
    // ບັງຄັບໃຫ້ລຶບຕາຕະລາງເກົ່າແລະສ້າງໃໝ່ທັງໝົດ
    await sequelize.sync({ force: true });
    
    console.log('ສ້າງຕາຕະລາງທັງໝົດສຳເລັດແລ້ວ!');
    console.log('ຕາຕະລາງທີ່ສ້າງ:');
    console.log('- employee_work_schedule');
    console.log('- position');
    console.log('- employee');
    console.log('- attendance');
    console.log('- special_allowance');
    console.log('- payroll');
    console.log('- users');
    console.log('- user_sessions');
    console.log('- user_permissions');

    await Role.bulkCreate([
      { name: 'super admin', description: 'Super Admin' },
      { name: 'admin', desdcription: 'Admin role' },
      { name: 'user', description: 'Regular users member' }
    ]);
    // ສ້າງຜູ້ໃຊ້ admin ເລີ່ມຕົ້ນ
    await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      full_name: 'System Administrator',
      role_id: 1, // admin
      status: true
    });

    
    console.log('ສ້າງຜູ້ໃຊ້ admin ເລີ່ມຕົ້ນສຳເລັດແລ້ວ');
    console.log('- username: admin');
    console.log('- password: admin123');
    
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດ:', error);
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
    }
  } finally {
    process.exit();
  }
}

forceSync();