// controllers/payroll.controller.js
const { calculatePayroll } = require('../services/calculatePayroll');
const { Payroll, Employee, SpecialAllowance } = require('../models');
const { Op } = require('sequelize');

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

const handleCalculatePayroll = async (req, res) => {
  try {
    const { employeeId, paymentDate, bonusMoney, tighMoney, foodMoney, ot, cutMoney } = req.body;

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid or missing employeeId' });
    }

    // ໃຊ້ວັນປະຈຸບັນເປັນ default ຖ້າ paymentDate ບໍ່ມີ
    let validPaymentDate = paymentDate ? new Date(paymentDate) : new Date();
    if (paymentDate && isNaN(validPaymentDate.getTime())) {
      return res.status(400).json({ status: 'error', message: 'Invalid paymentDate format' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }

    const payrollResult = await calculatePayroll(employeeId, validPaymentDate, {
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
// Get OT for all employees for the last month
const getAllEmployeeOtForLastMonth = async (req, res) => {
  try {
    const currentDate = new Date(); // ວັນປະຈຸບັນ: 15 ມິຖຸນາ 2025 06:57 PM +07
    const paymentMonth = currentDate.toISOString().slice(0, 7); // ໃຊ້ເດືອນປະຈຸບັນ: 2025-06

    const specialAllowances = await SpecialAllowance.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name'],
        },
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
    });

    const totalOt = specialAllowances.reduce((sum, allowance) => sum + (parseFloat(allowance.ot) || 0), 0);

    if (totalOt === 0) {
      return res.status(404).json({ status: 'error', message: 'No OT records found for the current month' });
    }

    return res.status(200).json({ status: 'success', data: { totalOt: totalOt.toFixed(2) } });
  } catch (error) {
    console.error('Error in getAllEmployeeOtForLastMonth:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve OT data', error: error.message });
  }
};
// Get OT for a specific employee for the current month
const getEmployeeOtForLastMonth = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id, 10);

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid or missing employeeId' });
    }

    const currentDate = new Date(); // ວັນປະຈຸບັນ: 15 ມິຖຸນາ 2025 08:37 PM +07
    const paymentMonth = currentDate.toISOString().slice(0, 7); // ໃຊ້ເດືອນປະຈຸບັນ: 2025-06

    const specialAllowance = await SpecialAllowance.findOne({
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name'],
          where: { employee_id: employeeId },
        },
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
    });

    if (!specialAllowance) {
      return res.status(404).json({ status: 'error', message: 'No OT record found for this employee in the current month' });
    }

    const otData = {
      employee_id: specialAllowance.employee.employee_id,
      name: specialAllowance.employee.name,
      ot: specialAllowance.ot || 0,
    };

    return res.status(200).json({ status: 'success', data: otData });
  } catch (error) {
    console.error('Error in getEmployeeOtForLastMonth:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve OT data', error: error.message });
  }
};
module.exports = {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,  
  handleCalculatePayroll,
  getPayrollByEmployeeId,
  getAllEmployeeOtForLastMonth,
  getEmployeeOtForLastMonth
};