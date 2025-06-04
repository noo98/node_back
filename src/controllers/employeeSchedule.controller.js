const EmployeeWorkSchedule = require('../models/EmployeeWorkSchedule');

// CREATE
const createSchedule = async (req, res) => {
  try {
    const { work_shift,shift_start, shift_end } = req.body;
    const schedule = await EmployeeWorkSchedule.create({ work_shift, shift_start, shift_end });
    return res.status(201).json(schedule);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ ALL
const getAllSchedules = async (req, res) => {
  try {
    const schedule = await EmployeeWorkSchedule.findAll();
    res.status(200).json(schedule); 
  } catch (err){
    res.status(500).json({ error: err.message});
  }
};


// READ ONE
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await EmployeeWorkSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    return res.status(200).json(schedule);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { work_shift, shift_start, shift_end } = req.body;
    const schedule = await EmployeeWorkSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    await schedule.update({ work_shift, shift_start, shift_end });
    return res.status(200).json(schedule);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await EmployeeWorkSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    await schedule.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};
