const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sequelize } = require("../db/connection");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ຄ້ົນຫາຜູ້ໃຊ້
    const [users] = await sequelize.query(
      `SELECT * FROM users WHERE LOWER(username) = LOWER($1)`,
      {
        bind: [username],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ກວດສອບຜູ້ໃຊ້
    if (!users) {
      return res.status(401).json({
        success: false,
        message: "ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
      });
    }

    // ກວດສອບສະຖານະບັນຊີ
    if (!users.status) {
      return res.status(401).json({
        success: false,
        message: "ບັນຊີນີ້ຖືກລະງັບໄວ້ຊົ່ວຄາວ",
      });
    }

    // ກວດສອບລະຫັດຜ່ານຫຼາຍວິທີ
    const passwordChecks = [
      await bcrypt.compare(password, users.password),
      await bcrypt.compare(password.trim(), users.password),
      await bcrypt.compare(password.replace(/\s+/g, ''), users.password)
    ];

    // ກວດສອບລະຫັດຜ່ານ
    if (!passwordChecks.some(check => check)) {
      console.log("Password comparison failed for user:", username);
      console.log("Stored hash:", users.password);
      console.log("Input passwords checked:", [
        password, 
        password.trim(), 
        password.replace(/\s+/g, '')
      ]);

      return res.status(401).json({
        success: false,
        message: "ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
        debugInfo: {
          usernameLength: username.length,
          passwordLength: password.length,
          storedHashLength: users.password.length
        }
      });
    }

    // ສ້າງ Token
    const token = jwt.sign(
      {
        id: users.user_id,
        username: users.username,
        role_id: users.role_id,
        email: users.email,
        full_name: users.full_name,
        profile_image: users.profile_image || null,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // ອັບເດດການເຂົ້າສູ່ລະບົບຫຼ້າສຸດ
    await sequelize.query(
      `UPDATE users SET last_login = NOW() WHERE user_id = $1`,
      {
        bind: [users.user_id],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.json({
      success: true,
      message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
      data: {
        token,
        user: {
          id: users.user_id,
          username: users.username,
          full_name: users.full_name,
          role_id: users.role_id,
          email: users.email,
          profile_image: users.profile_image || null,
        },
      },
    });

  } catch (error) {
    console.error("ຜິດພາດໃນການລັອກອິນ:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};


exports.register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນໃນຄຳຮ້ອງ",
      });
    }

    console.log("Registration request body:", req.body);

    const { username, password, email, full_name, role_id, employee_id } =
      req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາລະບຸຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ",
      });
    }

    let profileImage = null;

    const [existingUser] = await sequelize.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      {
        bind: [username, email || ""],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຜູ້ໃຊ້ຫຼືອີເມວຖືກນຳໃຊ້ແລ້ວ",
      });
    }

    if (req.files && req.files.profile_image) {
      const profileImageFile = req.files.profile_image;
      const uploadDir = path.join(__dirname, "../uploads/profiles");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${username}${path.extname(
        profileImageFile.name
      )}`;
      const uploadPath = path.join(uploadDir, fileName);

      await profileImageFile.mv(uploadPath);

      profileImage = `/uploads/profiles/${fileName}`;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await sequelize.query(
      `
      INSERT INTO users (
        username, password, email, full_name, role_id, status, profile_image, created_at, updated_at, employee_id
      ) VALUES (
        $1, $2, $3, $4, $5, TRUE, $6, NOW(), NOW(), $7
      ) RETURNING user_id, username, email, role_id, profile_image, employee_id
    `,
      {
        bind: [
          username,
          hashedPassword,
          email || "",
          full_name || "",
          role_id || null,
          profileImage || "",
          employee_id || null, // ເພີ່ມຄ່າ employee_id ທີ່ດຶງມາຈາກ req.body ໃນຂ້າງເທິງ
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // ຮັບໄອດີຜູ້ໃຊ້ທີ່ສ້າງໃໝ່
    const newUserId = result[0]?.user_id;

    // ດຶງຂໍ້ມູນຜູ້ໃຊ້ໃໝ່
    const [newUser] = await sequelize.query(
      `SELECT user_id, username, email, role_id, profile_image, employee_id FROM users WHERE user_id = $1`,
      {
        bind: [newUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(201).json({
      success: true,
      message: "ລົງທະບຽນຜູ້ໃຊ້ສຳເລັດແລ້ວ",
      data: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
        employee_id: newUser.employee_id,
        profile_image: newUser.profile_image,
      },
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການລົງທະບຽນ:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ: " + error.message,
    });
  }
};
// ດຶງຂໍ້ມູນຜູ້ໃຊ້ຕາມ ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາລະບຸ ID ຂອງຜູ້ໃຊ້",
      });
    }

    const [user] = await sequelize.query(
      `SELECT user_id, username, email, full_name, role_id, employee_id, profile_image, status, created_at, updated_at, last_login 
       FROM users WHERE user_id = $1`,
      {
        bind: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຜູ້ໃຊ້ທີ່ຕ້ອງການ",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role_id: user.role_id,
        employee_id: user.employee_id,
        profile_image: user.profile_image,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້",
    });
  }
};

// ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, password, ...otherFields } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາລະບຸ ID ຂອງຜູ້ໃຊ້",
      });
    }

    // ຟັງຊັ້ນຊ່ວຍຮັດຊັ່ວລະຫັດຜ່ານ
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };

    // ຈັດຕຽມຂໍ້ມູນສຳລັບອັບເດດ
    const updateFields = {};
    
    // ກວດສອບແລະເພີ່ມຂໍ້ມູນທີ່ຈະອັບເດດ
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (full_name) updateFields.full_name = full_name;

    // ກວດສອບແລະຮັດຊັ່ວລະຫັດຜ່ານຖ້າມີການສົ່ງມາ
    if (password) {
      updateFields.password = await hashPassword(password);
    }

    // ເພີ່ມຟິວອື່ນໆທີ່ອາດຈະສົ່ງມາ
    Object.keys(otherFields).forEach(key => {
      updateFields[key] = otherFields[key];
    });

    // ສ້າງຄຳສັ່ງ SQL ແບບໄດນາມິກ
    const updateQuery = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const bindValues = [
      ...Object.values(updateFields),
      userId
    ];

    // ດຳເນີນການອັບເດດ
    const updateSql = `
      UPDATE users 
      SET ${updateQuery}, updated_at = NOW() 
      WHERE user_id = $${bindValues.length}
      RETURNING *
    `;

    const [updatedUser] = await sequelize.query(updateSql, {
      bind: bindValues,
      type: sequelize.QueryTypes.UPDATE,
    });

    // ກວດສອບວ່າອັບເດດສຳເລັດຫຼືບໍ່
    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ສາມາດອັບເດດຜູ້ໃຊ້ໄດ້",
      });
    }

    // ສົ່ງຂໍ້ມູນຜູ້ໃຊ້ຫຼັງອັບເດດກັບໄປ
    res.json({
      success: true,
      message: "ອັບເດດຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
      data: {
        id: updatedUser[0].user_id,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        full_name: updatedUser[0].full_name,
        // ເພີ່ມຟິວອື່ນໆຕາມຄວາມຈຳເປັນ
      }
    });

  } catch (error) {
    console.error("ຜິດພາດໃນການອັບເດດຜູ້ໃຊ້:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຜູ້ໃຊ້",
      errorDetails: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// ລົບຜູ້ໃຊ້
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາລະບຸ ID ຂອງຜູ້ໃຊ້",
      });
    }

    // ກວດສອບວ່າຜູ້ໃຊ້ມີຢູ່ຈິງຫຼືບໍ່
    const [existingUser] = await sequelize.query(
      `SELECT * FROM users WHERE user_id = $1`,
      {
        bind: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຜູ້ໃຊ້ທີ່ຕ້ອງການລົບ",
      });
    }

    // ລົບຮູບພາບ profile ຖ້າມີ
    if (
      existingUser.profile_image &&
      existingUser.profile_image !== "" &&
      fs.existsSync(path.join(__dirname, "..", existingUser.profile_image))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", existingUser.profile_image));
    }

    // ລົບຂໍ້ມູນ session ຂອງຜູ້ໃຊ້
    await sequelize.query(
      `DELETE FROM user_sessions WHERE user_id = $1`,
      {
        bind: [userId],
        type: sequelize.QueryTypes.DELETE,
      }
    );

    // ລົບຂໍ້ມູນຜູ້ໃຊ້
    await sequelize.query(
      `DELETE FROM users WHERE user_id = $1`,
      {
        bind: [userId],
        type: sequelize.QueryTypes.DELETE,
      }
    );

    res.json({
      success: true,
      message: "ລົບຜູ້ໃຊ້ສຳເລັດແລ້ວ",
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການລົບຜູ້ໃຊ້:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການລົບຜູ້ໃຊ້: " + error.message,
    });
  }
};
// ດຶງຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ
exports.getAllUsers = async (req, res) => {
  try {
    // ກຳນົດໜ້າແລະຈຳນວນລາຍການຕໍ່ໜ້າ
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // ດຶງຈຳນວນຜູ້ໃຊ້ທັງໝົດ
    const [totalResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM users`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const totalUsers = parseInt(totalResult.total);

    // ດຶງຂໍ້ມູນຜູ້ໃຊ້
    const users = await sequelize.query(
      `SELECT 
        user_id, 
        username, 
        email, 
        full_name,  
        employee_id, 
        profile_image, 
        status, 
        created_at, 
        updated_at, 
        last_login,
        role_id  
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      {
        bind: [limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ຄຳນວນຈຳນວນໜ້າທັງໝົດ
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          employee_id: user.employee_id,
          profile_image: user.profile_image,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login: user.last_login,
        })),
        pagination: {
          total: totalUsers,
          page: page,
          limit: limit,
          totalPages: totalPages
        }
      },
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// ຟັງຊັ້ນຄົ້ນຫາຜູ້ໃຊ້
exports.searchUsers = async (req, res) => {
  try {
    const { 
      username, 
      email,  
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    // ກຳນົດເງື່ອນໄຂການຄົ້ນຫາ
    const whereConditions = [];
    const bindValues = [];
    let paramIndex = 1;

    if (username) {
      whereConditions.push(`LOWER(username) LIKE LOWER($${paramIndex})`);
      bindValues.push(`%${username}%`);
      paramIndex++;
    }

    if (email) {
      whereConditions.push(`LOWER(email) LIKE LOWER($${paramIndex})`);
      bindValues.push(`%${email}%`);
      paramIndex++;
    }

    if (role_id) {
      whereConditions.push(`role_id = $${paramIndex}`);
      bindValues.push(role_id);
      paramIndex++;
    }

    if (status !== undefined) {
      whereConditions.push(`status = $${paramIndex}`);
      bindValues.push(status);
      paramIndex++;
    }

    // ຄຳນວນ offset
    const offsetValue = (page - 1) * limit;
    bindValues.push(limit, offsetValue);

    // ສ້າງຄຳສັ່ງ SQL ແບບເງື່ອນໄຂ
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // ນັບຈຳນວນທັງໝົດ
    const [totalResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      {
        bind: bindValues.slice(0, -2),
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const totalUsers = parseInt(totalResult.total);

    // ດຶງຂໍ້ມູນຜູ້ໃຊ້
    const [users] = await sequelize.query(
      `SELECT 
        user_id, 
        username, 
        email, 
        full_name, 
        role_id, 
        employee_id, 
        profile_image, 
        status, 
        created_at, 
        updated_at, 
        last_login 
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      {
        bind: bindValues,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ຄຳນວນຈຳນວນໜ້າ
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          employee_id: user.employee_id,
          profile_image: user.profile_image,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login: user.last_login,
        })),
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: totalPages
        }
      },
    });
  } catch (error) {
    console.error("ຜິດພາດໃນການຄົ້ນຫາຜູ້ໃຊ້:", error);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາຜູ້ໃຊ້",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// ເພີ່ມການ import models ທີ່ຈຳເປັນໃນເທິງຂອງ file
const { User, RolePermission, SubMenu, MainMenu } = require('../models');
 
exports.getUserMenu = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Find role_id
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const roleId = user.role_id;

    // Step 2: Get role permissions
    const rolePermissions = await RolePermission.findAll({
      where: { role_id: roleId },
      attributes: ['sub_id'] // หรือ sub_id ตามที่ใช้ใน table
    });

    if (!rolePermissions.length) {
      return res.json([]);
    }

    // Extract sub menu IDs
    const subMenuIds = rolePermissions.map(p => p.sub_id);

    // Step 3: Get sub menus with main menus
    const subMenus = await SubMenu.findAll({
      where: { 
        sub_id: subMenuIds // ใช้ sub_id เป็น primary key
      },
      include: [{
        model: MainMenu,
        attributes: ['main_id', 'name','icon'] // ใช้ main_id เป็น primary key
      }],
      attributes: ['sub_id', 'name', 'url','icon', 'main_id']
    });

    // Step 4: Group by main_menu
    const grouped = {};
    subMenus.forEach(sm => {
      const mm = sm.MainMenu;
      
      if (!mm) return; // Skip if no main menu

      if (!grouped[mm.main_id]) {
        grouped[mm.main_id] = {
          main_id: mm.main_id,
          name: mm.name,
          icon: mm.icon,
          children: []
        };
      }

      grouped[mm.main_id].children.push({
        sub_id: sm.sub_id,
        name: sm.name,
        url: sm.url,
        icon: sm.icon
      });
    });

    // Convert object to array
    const result = Object.values(grouped);

    res.json(result);

  } catch (error) {
    console.error('Error building menu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};