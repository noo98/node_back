const { Product, User } = require('../models');
const ApiError = require('../utils/apiError');

// ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// ດຶງຂໍ້ມູນສິນຄ້າຕາມ ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    if (!product) {
      return next(new ApiError(`ບໍ່ພົບສິນຄ້າທີ່ມີ ID: ${id}`, 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// ສ້າງສິນຄ້າໃໝ່
exports.createProduct = async (req, res, next) => {
  try {
    // ຖ້າບໍ່ມີ userId ໃນ req.body, ໃຊ້ userId ຈາກ req.user (ຈາກ auth middleware)
    if (!req.body.userId && req.user) {
      req.body.userId = req.user.id;
    }
    
    const newProduct = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { product: newProduct }
    });
  } catch (error) {
    next(error);
  }
};

// ອັບເດດຂໍ້ມູນສິນຄ້າ
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return next(new ApiError(`ບໍ່ພົບສິນຄ້າທີ່ມີ ID: ${id}`, 404));
    }
    
    // ກວດສອບສິດໃນການອັບເດດຂໍ້ມູນ (ຖ້າຜູ້ໃຊ້ບໍ່ແມ່ນເຈົ້າຂອງຫຼື admin)
    if (req.user && req.user.role !== 'admin' && product.userId !== req.user.id) {
      return next(new ApiError('ທ່ານບໍ່ມີສິດອັບເດດຂໍ້ມູນສິນຄ້ານີ້', 403));
    }
    
    await product.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// ລຶບສິນຄ້າ
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return next(new ApiError(`ບໍ່ພົບສິນຄ້າທີ່ມີ ID: ${id}`, 404));
    }
    
    // ກວດສອບສິດໃນການລຶບຂໍ້ມູນ
    if (req.user && req.user.role !== 'admin' && product.userId !== req.user.id) {
      return next(new ApiError('ທ່ານບໍ່ມີສິດລຶບສິນຄ້ານີ້', 403));
    }
    
    await product.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};