const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');

// ດຶງຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// ດຶງຂໍ້ມູນຜູ້ໃຊ້ຕາມ ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return next(new ApiError(`ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີ ID: ${id}`, 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// ສ້າງຜູ້ໃຊ້ໃໝ່
exports.createUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    
    // ຈັດການກັບຂໍ້ມູນສ່ວນຕົວ - ບໍ່ສົ່ງລະຫັດຜ່ານກັບຄືນ
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;
    
    res.status(201).json({
      status: 'success',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    next(error);
  }
};

// ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return next(new ApiError(`ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີ ID: ${id}`, 404));
    }
    
    await user.update(req.body);
    
    // ຈັດການກັບຂໍ້ມູນສ່ວນຕົວ
    const updatedUser = user.toJSON();
    delete updatedUser.password;
    
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// ລຶບຜູ້ໃຊ້
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return next(new ApiError(`ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີ ID: ${id}`, 404));
    }
    
    await user.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};