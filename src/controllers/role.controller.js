// src/controllers/role.controller.js
const Role = require('../models/Role');

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາລະບຸຊື່ຂອງ Role"
      });
    }

    const role = await Role.create({ name, description });
    res.status(201).json({
      success: true,
      message: "ສ້າງ Role ສຳເລັດ",
      data: role
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການສ້າງ Role:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການສ້າງ Role",
      error: error.message
    });
  }
};

// Get All Roles
exports.getAllRoles = async (req, res) => {
  try {
    const role = await Role.findAll();
    res.status(200).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message})
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບ Role ທີ່ຕ້ອງການ"
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການດຶງຂໍ້ມູນ Role:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ Role",
      error: error.message
    });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, description } = req.body;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບ Role ທີ່ຕ້ອງການ"
      });
    }

    await role.update({ name, description });
    res.json({
      success: true,
      message: "ອັບເດດ Role ສຳເລັດ",
      data: role
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການອັບເດດ Role:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ Role",
      error: error.message
    });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບ Role ທີ່ຕ້ອງການລົບ"
      });
    }

    await role.destroy();
    res.json({
      success: true,
      message: "ລົບ Role ສຳເລັດ"
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການລົບ Role:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການລົບ Role",
      error: error.message
    });
  }
};