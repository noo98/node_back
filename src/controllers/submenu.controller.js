// src/controllers/submenu.controller.js
const { SubMenu } = require('../models');

// Create
const createSubMenu = async (req, res) => {
  try {
    const { main_id, name, url,actions, icon } = req.body;
    const subMenu = await SubMenu.create({ main_id, name, url,actions,icon });
    res.status(201).json(subMenu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
const getAllSubMenus = async (req, res) => {
  try {
    const subMenus = await SubMenu.findAll();
    res.status(200).json(subMenus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read by ID
const getSubMenuById = async (req, res) => {
  try {
    const subMenu = await SubMenu.findByPk(req.params.id);
    if (!subMenu) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(subMenu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
const updateSubMenu = async (req, res) => {
  try {
    const subMenu = await SubMenu.findByPk(req.params.id);
    if (!subMenu) return res.status(404).json({ error: 'Not found' });

    const { main_id, name, url,actions, icon } = req.body;
    await subMenu.update({ main_id, name, url,actions, icon });
    res.status(200).json(subMenu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
const deleteSubMenu = async (req, res) => {
  try {
    const subMenu = await SubMenu.findByPk(req.params.id);
    if (!subMenu) return res.status(404).json({ error: 'Not found' });

    await subMenu.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSubMenu,
  getAllSubMenus,
  getSubMenuById,
  updateSubMenu,
  deleteSubMenu
};
