// src/services/calculatePayroll.js
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const Position = require('../models/Position');
const BaseSalary = require('../models/BaseSalary');
const SpecialAllowance = require('../models/SpecialAllowance');
const Payroll = require('../models/Payroll');

// ຟັງຊັນເພື່ອຄຳນວນແລະບັນທຶກເງິນເດືອນສຸດທິ
async function calculatePayroll(employeeId, paymentDate, payrollData) {
  try {
    const { baseSalary, bonusMoney, tighMoney, foodMoney, ot, cutMoney } = payrollData;

    // ກວດສອບຂໍ້ມູນພະນັກງານ
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // ກຳນົດເດືອນຈາກ paymentDate
    const paymentMonth = new Date(paymentDate).toISOString().slice(0, 7); // e.g., "2025-06"

    // ຊອກຫາ SpecialAllowance ທີ່ຕົງກັບເດືອນ ແລະ employee_id
    let specialAllowance = await SpecialAllowance.findOne({
      where: {
        employee_id: employeeId,
        created_at: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1),
        },
      },
    });

    // ຖ້າບໍ່ມີ, ສ້າງໃໝ່
    if (!specialAllowance) {
      specialAllowance = await SpecialAllowance.create({
        employee_id: employeeId,
        bonus_money: bonusMoney || 0,
        tigh_money: tighMoney || 0,
        food_money: foodMoney || 0,
        ot: ot || 0,
      });
    } else {
      await specialAllowance.update({
        bonus_money: bonusMoney || specialAllowance.bonus_money,
        tigh_money: tighMoney || specialAllowance.tigh_money,
        food_money: foodMoney || specialAllowance.food_money,
        ot: ot || specialAllowance.ot,
      });
    }

    // ຄຳນວນຍອດລວມກ່ອນຫັກ
    const totalSalaryBeforeCut =
      parseFloat(baseSalary || 0) +
      parseFloat(bonusMoney || 0) +
      parseFloat(tighMoney || 0) +
      parseFloat(foodMoney || 0) +
      parseFloat(ot || 0);

    // ໃຊ້ cutMoney ຈາກ input
    const calculatedCutMoney = parseFloat(cutMoney || 0);

    // ຄຳນວນເງິນເດືອນສຸດທິ
    const netSalary = totalSalaryBeforeCut - calculatedCutMoney;

    // ບັນທຶກຂໍ້ມູນໃນ Payroll
    const payroll = await Payroll.create({
      employee_id: employeeId,
      special_allowance_id: specialAllowance.special_allowance_id,
      base_salary: baseSalary || 0,
      cut_money: calculatedCutMoney,
      net_salary: netSalary.toFixed(2),
      payment_date: paymentDate || new Date(),
    });

    return {
      employeeId: employee.employee_id,
      name: employee.name,
      baseSalary: baseSalary || 0,
      bonusMoney: bonusMoney || 0,
      tighMoney: tighMoney || 0,
      foodMoney: foodMoney || 0,
      ot: ot || 0,
      cutMoney: calculatedCutMoney,
      netSalary: netSalary.toFixed(2),
      paymentDate: payroll.payment_date,
    };
  } catch (error) {
    console.error('Error calculating payroll:', error);
    throw error;
  }
}

module.exports = { calculatePayroll };