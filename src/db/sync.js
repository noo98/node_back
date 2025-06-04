// src/db/sync.js
const { sequelize } = require('../models');

async function syncDatabase(force = false) {
  try {
    console.log(`ກຳລັງສ້າງຕາຕະລາງໃນຖານຂໍ້ມູນ (force = ${force})...`);
    await sequelize.sync({ force: force, alter: !force });
    console.log(`ຕາຕະລາງຖືກ ${force ? 'ສ້າງຄືນໃໝ່' : 'ອັບເດດ'} ສຳເລັດແລ້ວ`);
    return true;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການ sync ຖານຂໍ້ມູນ:', error);
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
    }
    return false;
  }
}

module.exports = syncDatabase;