// src/controllers/specialAllowance.controller.js
const { SpecialAllowance, Employee } = require('../models');

// Create a new special allowance record
const createSpecialAllowance = async (req, res) => {
  try {
    const { employee_id,tigh_money, bonus_money, food_money,ot } = req.body;
    const specialAllowance = await SpecialAllowance.create({
      employee_id,tigh_money, bonus_money, food_money,ot
    });
    return res.status(201).json(specialAllowance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all special allowance records with employee details
const getAllSpecialAllowances = async (req, res) => {
  try {
    const specialAllowances = await SpecialAllowance.findAll({
      include: [{ model: Employee, as: 'employee' }]
    });
    return res.status(200).json(specialAllowances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a special allowance record by ID with employee details
const getSpecialAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const specialAllowance = await SpecialAllowance.findByPk(parsedId, {
      include: [{ model: Employee, as: 'employee' }]
    });
    if (!specialAllowance) {
      return res.status(404).json({ error: 'Special allowance record not found' });
    }
    return res.status(200).json(specialAllowance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a special allowance record
const updateSpecialAllowance = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const { employee_id,tigh_money, bonus_money, food_money,ot } = req.body;

    const specialAllowance = await SpecialAllowance.findByPk(parsedId);
    if (!specialAllowance) {
      return res.status(404).json({ error: 'Special allowance record not found' });
    }

    await specialAllowance.update({
      employee_id,tigh_money, bonus_money, food_money,ot
    });
    return res.status(200).json(specialAllowance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a special allowance record
const deleteSpecialAllowance = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const specialAllowance = await SpecialAllowance.findByPk(parsedId);
    if (!specialAllowance) {
      return res.status(404).json({ error: 'Special allowance record not found' });
    }
    await specialAllowance.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSpecialAllowance,
  getAllSpecialAllowances,
  getSpecialAllowanceById,
  updateSpecialAllowance,
  deleteSpecialAllowance
};