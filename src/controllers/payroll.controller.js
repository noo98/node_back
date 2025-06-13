// controllers/payroll.controller.js
const { calculatePayroll } = require('../services/calculatePayroll');
const { Payroll, Employee, SpecialAllowance } = require('../models');

// Create a new payroll record
const createPayroll = async (req, res) => {
  try {
    const { employee_id, special_allowance_id, base_salary, cut_money, net_salary, payment_date } = req.body;
    const payroll = await Payroll.create({
      employee_id,
      special_allowance_id,
      base_salary,
      cut_money,
      net_salary,
      payment_date
    });
    return res.status(201).json({ status: 'success', data: payroll });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all payroll records with employee and special allowance details
const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [
        { model: Employee, as: 'employee', attributes: ['employee_id', 'name'] },
        { model: SpecialAllowance, as: 'specialAllowance', attributes: ['special_allowance_id', 'bonus_money', 'tigh_money', 'food_money', 'ot'] }
      ]
    });
    res.status(200).json({ status: 'success', data: payrolls });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get a payroll record by ID with employee and special allowance details
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const payroll = await Payroll.findByPk(parsedId, {
      include: [
        { model: Employee, as: 'employee', attributes: ['employee_id', 'name'] },
        { model: SpecialAllowance, as: 'specialAllowance', attributes: ['special_allowance_id', 'bonus_money', 'tigh_money', 'food_money', 'ot'] }
      ]
    });
    if (!payroll) {
      return res.status(404).json({ status: 'error', message: 'Payroll record not found' });
    }
    return res.status(200).json({ status: 'success', data: payroll });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a payroll record
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const { employee_id, special_allowance_id, base_salary, cut_money, net_salary, payment_date } = req.body;

    const payroll = await Payroll.findByPk(parsedId);
    if (!payroll) {
      return res.status(404).json({ status: 'error', message: 'Payroll record not found' });
    }

    await payroll.update({
      employee_id,
      special_allowance_id,
      base_salary,
      cut_money,
      net_salary,
      payment_date
    });
    return res.status(200).json({ status: 'success', data: payroll });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a payroll record
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    const payroll = await Payroll.findByPk(parsedId);
    if (!payroll) {
      return res.status(404).json({ status: 'error', message: 'Payroll record not found' });
    }
    await payroll.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// controllers/payroll.controller.js (ສ່ວນ handleCalculatePayroll)
const handleCalculatePayroll = async (req, res) => {
  try {
    const { employeeId, paymentDate, baseSalary, bonusMoney, tighMoney, foodMoney, ot, cutMoney } = req.body;

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid or missing employeeId' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }

    const payrollResult = await calculatePayroll(employeeId, paymentDate, {
      baseSalary,
      bonusMoney,
      tighMoney,
      foodMoney,
      ot,
      cutMoney,
    });
    return res.status(200).json({ status: 'success', data: payrollResult });
  } catch (error) {
    console.error('Error in calculatePayroll:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to calculate payroll', error: error.message });
  }
};

// Get payroll records by employee ID
const getPayrollByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid or missing employeeId' });
    }

    const payrolls = await Payroll.findAll({
      where: { employee_id: employeeId },
      include: [
        { model: Employee, as: 'employee', attributes: ['employee_id', 'name'] },
        { model: SpecialAllowance, as: 'specialAllowance', attributes: ['special_allowance_id', 'bonus_money', 'tigh_money', 'food_money', 'ot'] }
      ],
    });

    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No payroll records found for this employee' });
    }

    return res.status(200).json({ status: 'success', data: payrolls });
  } catch (error) {
    console.error('Error in getPayrollByEmployeeId:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve payroll data', error: error.message });
  }
};

module.exports = {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,  
  handleCalculatePayroll,
  getPayrollByEmployeeId
};