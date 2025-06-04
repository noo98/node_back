// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    // ຮັບ token ຈາກ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, ກະລຸນາເຂົ້າສູ່ລະບົບ' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // ກວດສອບວ່າ token ຍັງໃຊ້ໄດ້ໃນຖານຂໍ້ມູນ
    const session = await UserSession.findOne({
      where: {
        token,
        is_valid: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, session ໝົດອາຍຸຫຼືບໍ່ຖືກຕ້ອງ' 
      });
    }
    
    // ຖອດລະຫັດ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ຊອກຫາຜູ້ໃຊ້
    const user = await User.findByPk(decoded.id);
    if (!user || !user.status) {
      return res.status(401).json({ 
        success: false, 
        message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, ບັນຊີບໍ່ພົບຫຼືຖືກລະງັບ' 
      });
    }
    
    // ບັນທຶກຂໍ້ມູນຜູ້ໃຊ້ໃນ request
    req.user = {
      id: user.user_id,
      username: user.username,
      role: user.role,
      employee_id: user.employee_id
    };
    
    next();
  } catch (error) {
    console.error('ຜິດພາດໃນການພິສູດຕົວຕົນ:', error);
    res.status(401).json({ 
      success: false, 
      message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, token ບໍ່ຖືກຕ້ອງ' 
    });
  }
};

// ກວດສອບວ່າຜູ້ໃຊ້ມີບົດບາດຕາມທີ່ກຳນົດຫຼືບໍ່
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, ກະລຸນາເຂົ້າສູ່ລະບົບ' 
      });
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງສ່ວນນີ້' 
    });
  };
};