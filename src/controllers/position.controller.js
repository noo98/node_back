const { Position, BaseSalary } = require('../models'); // ປັບໃຫ້ມີ BaseSalary
const { Op } = require('sequelize'); // ເພີ່ມເພື່ອໃຊ້ operator ສຳລັບ filter

// Create a new position
const createPosition = async (req, res) => {
  try {
    const { position_name, base_sal_id, rate_ot } = req.body;
    const position = await Position.create({ position_name, base_sal_id, rate_ot });
    return res.status(201).json(position);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all positions with filter by month
const getAllPositions = async (req, res) => {
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

    const positions = await Position.findAll({
      where: whereClause,
      include: [{ model: BaseSalary, as: 'baseSalary' }], // ປັບແປງເປັນ BaseSalary
      order: [['created_at', 'DESC']], // ຈັດລຽງຕາມວັນທີ່ສ້າງລ່າສຸດ
    });
    return res.status(200).json(positions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a position by ID
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id, {
      include: [{ model: BaseSalary, as: 'baseSalary' }], // ປັບແປງເປັນ BaseSalary
    });
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    return res.status(200).json(position);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a position
const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position_name, base_sal_id, rate_ot } = req.body;

    const position = await Position.findByPk(id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    await position.update({ position_name, base_sal_id, rate_ot });
    return res.status(200).json(position);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a position
const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    await position.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};