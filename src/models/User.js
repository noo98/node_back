// src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'user_id'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'username'
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'password'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    field: 'email'
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'full_name'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'role_id',
    references:{
      model: 'role',
      key:'role_id'
    }
    },
  profile_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'profile_image',
    comment: 'ເສັ້ນທາງໄປຫາຮູບໂປຣໄຟລ໌ຂອງຜູ້ໃຊ້'
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'employee_id',
    references: {
      model: 'employee',
      key: 'employee_id'
    }
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'status'  // true = active, false = inactive
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// ເພີ່ມເມທອດສຳລັບກວດສອບລະຫັດຜ່ານ
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// ເພີ່ມເມທອດສຳລັບຮັບທີ່ຢູ່ຮູບແບບເຕັມ
User.prototype.getProfileImageUrl = function() {
  if (!this.profile_image) return null;
  // ກວດສອບວ່າທີ່ຢູ່ຮູບເປັນ URL ເຕັມຫຼືບໍ່
  if (this.profile_image.startsWith('http://') || this.profile_image.startsWith('https://')) {
    return this.profile_image;
  }
  // ຖ້າບໍ່ແມ່ນ, ສ້າງທີ່ຢູ່ເຕັມຈາກທີ່ຢູ່ພາຍໃນ
  return `${process.env.APP_URL || ''}/uploads/profiles/${this.profile_image}`;
};

module.exports = User;