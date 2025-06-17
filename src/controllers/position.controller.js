// src/controllers/position.controller.js
const { Position } = require('../models');

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

// Get all positions
const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll();
    return res.status(200).json(positions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a position by ID
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id);
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