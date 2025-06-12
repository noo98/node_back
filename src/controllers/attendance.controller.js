// src/controllers/attendance.controller.js
const { Attendance, Employee } = require('../models');
const { Op } = require('sequelize');

const createAttendance = async (req, res) => {
  try {
    const { employee_id } = req.body;

    const now = new Date();
const currentTime = now.toTimeString().split(' ')[0];
const todayDate = now.toISOString().split('T')[0];

// Shift times
const shift1Start = new Date(`${todayDate}T08:00:00`);
const shift1LateLimit = new Date(shift1Start.getTime() + 15 * 60 * 1000);
const shift2Start = new Date(`${todayDate}T17:00:00`);
const shift2LateLimit = new Date(shift2Start.getTime() + 15 * 60 * 1000);

let isLate = false;
let shiftType = null;

// Determine shift by current time
if (now >= shift1Start && now < shift2Start) {
  shiftType = 'shift1';
  isLate = now > shift1LateLimit;
} else {
  shiftType = 'shift2';
  isLate = now > shift2LateLimit;
}

// Check if there's an open record today without check-out
const openAttendance = await Attendance.findOne({
  where: {
    employee_id,
    date: todayDate,
    check_out_time: null,
  },
  order: [['check_in_time', 'DESC']]  // for safety, use the latest one
});

if (openAttendance) {
  await openAttendance.update({ check_out_time: currentTime });
  return res.status(200).json({
    message: 'Checked out successfully (even outside shift time)',
    data: openAttendance
  });
} else {
  const newAttendance = await Attendance.create({
    employee_id,
    check_in_time: currentTime,
    date: todayDate,
    late: isLate,
    penalty_amount: isLate ? 25000 : 0
  });
  return res.status(201).json({
    message: `Checked in successfully for ${shiftType}`,
    data: newAttendance
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
    const attendances = await Attendance.findAll({
      where: { employee_id },
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

module.exports = {
  createAttendance,
  getAllAttendances,
  getAttendanceById,
  getAttendanceByEmployeeId,
  updateAttendance,
  deleteAttendance
};