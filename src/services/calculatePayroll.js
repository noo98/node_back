const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const Position = require('../models/Position');
const BaseSalary = require('../models/BaseSalary');
const SpecialAllowance = require('../models/SpecialAllowance');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');

async function calculatePayroll(employeeId, paymentDate, payrollData) {
  try {
    const { bonusMoney, tighMoney } = payrollData || {}; // ບໍ່ຮັບ foodMoney ຈາກ input

    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: Position,
          as: 'position',
          include: [{ model: BaseSalary, as: 'baseSalary' }],
        },
        {
          model: SpecialAllowance,
          as: 'specialAllowances',
        },
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    let baseSalary = 0;
    if (employee.position && employee.position.baseSalary && employee.position.baseSalary.salary) {
      baseSalary = parseFloat(employee.position.baseSalary.salary);
    } else {
      console.warn('BaseSalary not found for employee ID:', employeeId, 'using default value 0');
    }

    let validPaymentDate = new Date(paymentDate);
    if (isNaN(validPaymentDate.getTime())) {
      console.warn('Invalid paymentDate, using current date:', paymentDate);
      validPaymentDate = new Date();
    }
    const paymentMonth = validPaymentDate.toISOString().slice(0, 7);

    const specialAllowances = await SpecialAllowance.findAll({
      where: {
        employee_id: employeeId,
        created_at: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
    });
    const totalOt = specialAllowances.reduce((sum, allowance) => sum + parseFloat(allowance.ot || 0), 0);
    console.log('Total OT:', totalOt);

    const attendances = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        date: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
      attributes: ['date'], // ເລືອກພຽງ date ເພື່ອຫຼີກບັນທຶກຂໍ້ມູນເສຍເວລາ
      group: ['date'], // ລວມວັນທີ່ທີ່ແຕກຕ່າງກັນ
    });
    const uniqueDays = attendances.length; // ຈໍານວນເວລາທີ່ມີ check-in ແຕ່ລະວັນ
    const foodMoney = uniqueDays * 30000; // ຄຳນວນ food_money ທີ່ຖືກຕ້ອງ (30,000 ກີບຕໍ່ມື້)
    console.log('Calculated Food Money:', foodMoney);

    const attendancesForPenalty = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        date: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
    });
    const totalPenalty = attendancesForPenalty.reduce((sum, attendance) => sum + parseFloat(attendance.penalty_amount || 0), 0);
    console.log('Total Penalty:', totalPenalty);

    let specialAllowance = await SpecialAllowance.findOne({
      where: {
        employee_id: employeeId,
        created_at: {
          [Op.gte]: new Date(`${paymentMonth}-01`),
          [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
        },
      },
    });

    if (!specialAllowance) {
      specialAllowance = await SpecialAllowance.create({
        employee_id: employeeId,
        bonus_money: bonusMoney || 0,
        tigh_money: tighMoney || 0,
        food_money: foodMoney,
        ot: totalOt,
      });
    } else {
      await specialAllowance.update({
        bonus_money: bonusMoney || specialAllowance.bonus_money,
        tigh_money: tighMoney || specialAllowance.tigh_money,
        food_money: foodMoney, // ໃຊ້ຄ່າທີ່ຄຳນວນໄດ້
        ot: totalOt,
      });
    }

    const totalSalaryBeforeCut =
      baseSalary +
      parseFloat(bonusMoney || 0) +
      parseFloat(tighMoney || 0) +
      foodMoney +
      totalOt;

    const calculatedCutMoney = totalPenalty;

    const netSalary = totalSalaryBeforeCut - calculatedCutMoney;

    const payroll = await Payroll.create({
      employee_id: employeeId,
      special_allowance_id: specialAllowance.special_allowance_id,
      base_salary: baseSalary,
      cut_money: calculatedCutMoney,
      net_salary: netSalary.toFixed(2),
      payment_date: validPaymentDate,
    });

    return {
      employeeId: employee.employee_id,
      name: employee.name,
      baseSalary: baseSalary,
      bonusMoney: bonusMoney || 0,
      tighMoney: tighMoney || 0,
      foodMoney: foodMoney,
      ot: totalOt,
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