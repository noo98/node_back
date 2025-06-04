const RolePermission = require('../models/RolePermission');

// Create
const createRolePermission = async (req, res) => {
  try {
    const { role_id, sub_id } = req.body;
    const newPermission = await RolePermission.create({ role_id, sub_id });
    res.status(201).json(newPermission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read all with pagination
const getAllRolePermissions = async (req, res) => {
  try {
    const permission = await RolePermission.findAll();
    res.status(200).json(permission);
  } catch (err) {
    res.status(500).json({error: err.message})
  }
};


// Read one
const getRolePermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await RolePermission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
const updateRolePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, sub_id } = req.body;
    const permission = await RolePermission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    await permission.update({ role_id, sub_id });
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
const deleteRolePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await RolePermission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    await permission.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRolePermission,
  getAllRolePermissions,
  getRolePermissionById,
  updateRolePermission,
  deleteRolePermission
};
