// src/controllers/employee.controller.js
const { Employee } = require('../models');

const createEmployee = async (req, res) => {
  try {
    const { name, gender, birthdate, address, phone, schedule_id, position_id } = req.body;
    const employee = await Employee.create({ name, gender, birthdate, address, phone, schedule_id, position_id });
    return res.status(201).json(employee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employee = await Employee.findAll();
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const employee = await Employee.findByPk(parsedId, {
      include: ['schedule', 'position']
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const { name, gender, birthdate, address, phone, schedule_id, position_id } = req.body;

    const employee = await Employee.findByPk(parsedId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.update({ name, gender, birthdate, address, phone, schedule_id, position_id });
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const employee = await Employee.findByPk(parsedId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await employee.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};