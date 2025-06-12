// src/services/calculatePayroll.js
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const Position = require('../models/Position');
const BaseSalary = require('../models/BaseSalary');
const SpecialAllowance = require('../models/SpecialAllowance');
const Payroll = require('../models/Payroll');

// ຟັງຊັນເພື່ອຄຳນວນແລະບັນທຶກເງິນເດືອນສຸດທິ
async function calculatePayroll(employeeId, paymentDate) {
  try {
    // ດຶງຂໍ້ມູນພະນັກງານພ້ອມກັບ Position ແລະ SpecialAllowance
    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: Position,
          as: 'position',
          include: [{ model: BaseSalary, as: 'baseSalary' }],
        },
        {
          model: SpecialAllowance,
          as: 'specialAllowances', // ປ່ຽນເປັນ alias ທີ່ຕົງກັບ association
        },
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // ດຶງຂໍ້ມູນເງິນເດືອນພື້ນຖານ
    const baseSalary = employee.position.baseSalary.salary;

    // ດຶງຂໍ້ມູນເງິນເສີມພິເສດ (ຖ້າມີ)
    const specialAllowance = employee.specialAllowances && employee.specialAllowances.length > 0
      ? employee.specialAllowances[0] // ເຊົ້າໄປຂໍ້ມູນຕົ້ນຕໍຖ້າມີຫຼາຍຂໍ້ມູນ
      : {
          bonus_money: 0,
          tigh_money: 0,
          food_money: 0,
          ot: 0,
        };

    // ຄຳນວນຍອດລວມກ່ອນຫັກ
    const totalSalaryBeforeCut =
      parseFloat(baseSalary) +
      parseFloat(specialAllowance.bonus_money || 0) +
      parseFloat(specialAllowance.tigh_money || 0) +
      parseFloat(specialAllowance.food_money || 0) +
      parseFloat(specialAllowance.ot || 0);

    // ສົມມຸດວ່າ cut_money ຖືກກຳນົດໄວ້ລ່ວງໜ້າ (ຕົວຢ່າງ: ຄ່າພາສີ, ປະກັນສັງຄົມ)
    const cutMoney = 0; // ສາມາດປັບແຕ່ງໄດ້ຕາມຄວາມຕ້ອງການ

    // ຄຳນວນເງິນເດືອນສຸດທິ
    const netSalary = totalSalaryBeforeCut - parseFloat(cutMoney || 0);

    // ບັນທຶກຂໍ້ມູນໃນ Payroll
    const payroll = await Payroll.create({
      employee_id: employeeId,
      special_allowance_id: specialAllowance.special_allowance_id || null,
      base_salary: baseSalary,
      cut_money: cutMoney,
      net_salary: netSalary.toFixed(2),
      payment_date: paymentDate || new Date(),
    });

    return {
      employeeId: employee.employee_id,
      name: employee.name,
      baseSalary: baseSalary,
      bonusMoney: specialAllowance.bonus_money || 0,
      tighMoney: specialAllowance.tigh_money || 0,
      foodMoney: specialAllowance.food_money || 0,
      ot: specialAllowance.ot || 0,
      cutMoney: cutMoney,
      netSalary: netSalary.toFixed(2),
      paymentDate: payroll.payment_date,
    };
  } catch (error) {
    console.error('Error calculating payroll:', error);
    throw error;
  }
}

module.exports = { calculatePayroll };