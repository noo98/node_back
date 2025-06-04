const { BaseSalary } = require ('../models');

const createBaseSalary = async (req, res) => {
    try {
        const { salary } = req.body;
        const baseSalary = await BaseSalary.create({ salary });
        return res.status(200).json(baseSalary);
    } catch (error){
        return res.status(500).json({ error: error.message });
    }
};

const getAllBaseSalary = async (req, res) => {
    try {
        const baseSalary = await BaseSalary.findAll();
        res.status(200).json(baseSalary);
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
};

const getAllBaseSalaryById = async ( req, res) => {
    try {
        const { id } = req.params;
        const baseSalary = await BaseSalary.findByPk(id);
        if (!baseSalary) {
        return res.status(404).json({ error: 'Base salary not found' });
        }
        return res.status(200).json(baseSalary);
    } catch (error) {
         return res.status(500).json({ error: error.message });
    }
};

const updateBaseSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;
    const baseSalary = await BaseSalary.findByPk(id);
    if (!baseSalary) {
      return res.status(404).json({ error: 'Base salary not found' });
    }
    await baseSalary.update({ salary });
    return res.status(200).json(baseSalary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteBaseSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const baseSalary = await BaseSalary.findByPk(id);
    if (!baseSalary) {
      return res.status(404).json({ error: 'Base salary not found' });
    }
    await baseSalary.destroy();
    return res.status(204).json(BaseSalary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
    createBaseSalary,
    getAllBaseSalary,
    getAllBaseSalaryById,
    updateBaseSalary,
    deleteBaseSalary 
};