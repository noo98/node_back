const { Attendance, Employee, EmployeeWorkSchedule, SpecialAllowance, Position } = require('../models');
const { Op } = require('sequelize');

const createAttendance = async (req, res) => {
  try { 
    const { employee_id, check_in_time, check_out_time, date } = req.body;

    if (!employee_id || isNaN(employee_id)) {
      return res.status(400).json({ error: 'Invalid or missing employee_id' });
    }

    const todayDate = date || new Date().toISOString().split('T')[0];

    const employee = await Employee.findByPk(employee_id, {
      include: [{ model: EmployeeWorkSchedule, as: 'schedule' }, { model: Position, as: 'position' }],
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const schedule = employee.schedule;
    if (!schedule) {
      return res.status(400).json({ error: 'Work schedule not found for this employee' });
    }

    const shiftStartTime = schedule.shift_start;
    const shiftEndTime = schedule.shift_end || '17:00:00'; 

    const shiftStart = new Date(`${todayDate}T${shiftStartTime}`);
    const shiftEnd = new Date(`${todayDate}T${shiftEndTime}`);

    let shiftType = null;
    const checkInTimeStr = check_in_time || new Date().toTimeString().split(' ')[0];
    const checkInTime = new Date(`${todayDate}T${checkInTimeStr}`);

    if (checkInTime >= shiftStart && checkInTime < shiftEnd) {
      shiftType = 'shift1';
    } else {
      shiftType = 'shift2';
    }

    const diffMs = checkInTime - shiftStart;
    const diffMinutes = Math.floor(diffMs / 60000);

    let isLate = false;
    let penalty = 0;

    if (diffMinutes > 15) {
      isLate = true;
      if (diffMinutes > 60) {
        penalty = 100000;
      } else if (diffMinutes > 30) {
        penalty = 50000;
      } else {
        penalty = 25000;
      }
    }

    const openAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: todayDate,
        check_out_time: null,
      },
      order: [['check_in_time', 'DESC']]
    });

    if (openAttendance) {
      const checkOutTimeStr = check_out_time || new Date().toTimeString().split(' ')[0];
      await openAttendance.update({ check_out_time: checkOutTimeStr });

      const checkOutTime = new Date(`${todayDate}T${checkOutTimeStr}`);
      const overtimeMs = checkOutTime - shiftEnd;
      const gracePeriodMs = 60 * 60 * 1000;

      let otAmount = 0;
      if (overtimeMs > gracePeriodMs) {
        const overtimeAfterGraceMs = overtimeMs - gracePeriodMs;
        const overtimeMinutes = Math.max(0, Math.floor(overtimeAfterGraceMs / (1000 * 60)));
        const rateOt = employee.position ? parseFloat(employee.position.rate_ot) || 0 : 0;
        const ratePerMinute = rateOt / 60;
        otAmount = overtimeMinutes * ratePerMinute;
      }

      const paymentMonth = todayDate.slice(0, 7);
      let specialAllowance = await SpecialAllowance.findOne({
        where: {
          employee_id,
          created_at: {
            [Op.gte]: new Date(`${paymentMonth}-01`),
            [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
          },
        },
      });

      if (!specialAllowance) {
        specialAllowance = await SpecialAllowance.create({
          employee_id,
          bonus_money: 0,
          tigh_money: 0,
          food_money: 0, 
          ot: otAmount,
        });
      } else {
        const newOt = parseFloat(specialAllowance.ot) + otAmount;
        const decimalPart = newOt % 1;
        let adjustedTotalOt;
        if (decimalPart >= 0.50) {
          adjustedTotalOt = Math.floor(newOt) + 1;
        } else {
          adjustedTotalOt = Math.floor(newOt);
        }
        await specialAllowance.update({ ot: adjustedTotalOt });
      }

      return res.status(200).json({
        message: 'Checked out successfully (even outside shift time)',
        data: openAttendance,
        otAmount: otAmount.toFixed(2),
        totalOt: specialAllowance.ot,
        foodMoney: specialAllowance.food_money,
      });
    } else {
      const newAttendance = await Attendance.create({
        employee_id,
        check_in_time: checkInTimeStr,
        date: todayDate,
        late: isLate,
        penalty_amount: penalty
      });

      const existingAttendanceToday = await Attendance.count({
        where: {
          employee_id,
          date: todayDate,
        },
      });

      const paymentMonth = todayDate.slice(0, 7);
      let specialAllowance = await SpecialAllowance.findOne({
        where: {
          employee_id,
          created_at: {
            [Op.gte]: new Date(`${paymentMonth}-01`),
            [Op.lt]: new Date(new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1)),
          },
        },
      });

      let newFoodMoney = 0;
      if (existingAttendanceToday === 1) {
        newFoodMoney = 30000;
      }

      if (!specialAllowance) {
        specialAllowance = await SpecialAllowance.create({
          employee_id,
          bonus_money: 0,
          tigh_money: 0,
          food_money: newFoodMoney,
          ot: 0,
        });
      } else {
        const currentFoodMoney = parseFloat(specialAllowance.food_money) || 0;
        newFoodMoney = currentFoodMoney + (existingAttendanceToday === 1 ? 30000 : 0);
        await specialAllowance.update({ food_money: newFoodMoney });
      }

      return res.status(201).json({
        message: `Checked in successfully for ${shiftType}`,
        data: newAttendance,
        foodMoney: specialAllowance.food_money,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all attendance records with employee details
const getAllAttendances = async (req, res) => {
  try {
    const attendance = await Attendance.findAll();
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get an attendance record by ID with employee details
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid attendance ID' });
    }
    const attendance = await Attendance.findByPk(parsedId, {
      include: [{ model: Employee, as: 'employee' }]
    });
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get attendances by employee ID
const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const parsedId = parseInt(employee_id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }
    const attendances = await Attendance.findAll({
      where: { employee_id: parsedId },
      include: [{ model: Employee, as: 'employee' }],
      order: [['date', 'DESC'], ['check_in_time', 'ASC']]
    });

    if (!attendances || attendances.length === 0) {
      return res.status(404).json({ error: 'No attendance records found for this employee' });
    }

    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update an attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid attendance ID' });
    }
    const { employee_id, check_in_time, check_out_time, date } = req.body;

    const attendance = await Attendance.findByPk(parsedId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await attendance.update({
      employee_id,
      check_in_time,
      check_out_time,
      date
    });
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete an attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid attendance ID' });
    }
    const attendance = await Attendance.findByPk(parsedId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    await attendance.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get count of employees late by more than 15 minutes today
const getLateTodayCount = async (req, res) => {
  try {
    console.log('Params:', req.params); // Debug: ກວດສອບ params
    const currentDate = new Date(); // 10:54 PM +07, 15 ມິຖຸນາ 2025
    const todayDate = currentDate.toISOString().split('T')[0]; // 2025-06-15

    const lateToday = await Attendance.count({
      where: {
        date: todayDate,
        late: true,
      },
      include: [{ model: Employee, as: 'employee' }],
    });

    return res.status(200).json({ status: 'success', data: { lateToday: lateToday } });
  } catch (error) {
    console.error('Error in getLateTodayCount:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve late today count', error: error.message });
  }
};

// Get count of employees absent today
const getAbsentTodayCount = async (req, res) => {
  try {
    console.log('Params:', req.params); // Debug: ກວດສອບ params
    const currentDate = new Date(); // 10:54 PM +07, 15 ມິຖຸນາ 2025
    const todayDate = currentDate.toISOString().split('T')[0]; // 2025-06-15

    const totalEmployees = await Employee.count();
    const attendedToday = await Attendance.count({
      where: { date: todayDate },
      distinct: true,
      col: 'employee_id',
    });
    const absentToday = totalEmployees - attendedToday;

    return res.status(200).json({ status: 'success', data: { absentToday: absentToday } });
  } catch (error) {
    console.error('Error in getAbsentTodayCount:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve absent today count', error: error.message });
  }
};

// Get count of employees late by more than 15 minutes this month
const getLateThisMonthCount = async (req, res) => {
  try {
    console.log('Params:', req.params); // Debug: ກວດສອບ params
    const currentDate = new Date(); // 10:54 PM +07, 15 ມິຖຸນາ 2025
    const currentMonth = currentDate.toISOString().slice(0, 7); // 2025-06

    const lateThisMonth = await Attendance.count({
      where: {
        date: { [Op.gte]: `${currentMonth}-01`, [Op.lt]: new Date(new Date(`${currentMonth}-01`).setMonth(new Date(`${currentMonth}-01`).getMonth() + 1)) },
        late: true,
      },
      include: [{ model: Employee, as: 'employee' }],
    });

    return res.status(200).json({ status: 'success', data: { lateThisMonth: lateThisMonth } });
  } catch (error) {
    console.error('Error in getLateThisMonthCount:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve late this month count', error: error.message });
  }
};

// Get count of employees absent this month
const getAbsentThisMonthCount = async (req, res) => {
  try {
    console.log('Params:', req.params); // Debug: ກວດສອບ params
    const currentDate = new Date(); // 10:54 PM +07, 15 ມິຖຸນາ 2025
    const currentMonth = currentDate.toISOString().slice(0, 7); // 2025-06

    const totalEmployees = await Employee.count();
    const attendedThisMonth = await Attendance.count({
      where: {
        date: { [Op.gte]: `${currentMonth}-01`, [Op.lt]: new Date(new Date(`${currentMonth}-01`).setMonth(new Date(`${currentMonth}-01`).getMonth() + 1)) },
      },
      distinct: true,
      col: 'employee_id',
    });
    const absentThisMonth = totalEmployees - attendedThisMonth;

    return res.status(200).json({ status: 'success', data: { absentThisMonth: absentThisMonth } });
  } catch (error) {
    console.error('Error in getAbsentThisMonthCount:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve absent this month count', error: error.message });
  }
};

module.exports = {
  createAttendance,
  getAllAttendances,
  getAttendanceById,
  getAttendanceByEmployeeId,
  updateAttendance,
  deleteAttendance,
  getLateTodayCount,
  getAbsentTodayCount,
  getLateThisMonthCount,
  getAbsentThisMonthCount
};