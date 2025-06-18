// src/controllers/specialAllowance.controller.js
const { SpecialAllowance, Employee } = require('../models');
const { Op } = require('sequelize');

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
    const { month } = req.query; // ດຶງ month ຈາກ query parameter
    let whereClause = {};

    if (month) {
      const [year, monthNum] = month.split('-');
      if (!year || !monthNum || isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM (e.g., 2025-06)' });
      }
      const startDate = new Date(`${year}-${monthNum}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      whereClause = {
        created_at: { // ສົງໄສວ່າໃຊ້ created_at ເປັນຊ່ອງເວລາ
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      };
    }

    const specialAllowances = await SpecialAllowance.findAll({
      where: whereClause,
      include: [{ model: Employee, as: 'employee' }],
      order: [['created_at', 'DESC']], // ຈັດລຽງຕາມວັນທີ່ສ້າງລ່າສຸດ
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
// Get special allowance records by employeeId with month filter
const getSpecialAllowanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query; // ດຶງ month ຈາກ query parameter
    const parsedId = parseInt(employeeId, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    let whereClause = { employee_id: parsedId };

    if (month) {
      const [year, monthNum] = month.split('-');
      if (!year || !monthNum || isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM (e.g., 2025-06)' });
      }
      const startDate = new Date(`${year}-${monthNum}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      whereClause.created_at = { // ສົງໄສວ່າ SpecialAllowance ໃຊ້ created_at ເປັນຊ່ອງເວລາ
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      };
    }

    const specialAllowances = await SpecialAllowance.findAll({
      where: whereClause,
      include: [{ model: Employee, as: 'employee' }],
      order: [['created_at', 'DESC']], // ຈັດລຽງຕາມວັນທີ່ສ້າງລ່າສຸດ
    });

    if (!specialAllowances || specialAllowances.length === 0) {
      return res.status(404).json({ error: 'No special allowance records found for this employee' });
    }

    return res.status(200).json(specialAllowances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createSpecialAllowance,
  getAllSpecialAllowances,
  getSpecialAllowanceById,
  updateSpecialAllowance,
  deleteSpecialAllowance,
  getSpecialAllowanceByEmployeeId
};