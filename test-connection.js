// test-connection.js
const { sequelize } = require('./src/db/connection');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('ການເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນສຳເລັດແລ້ວ!');
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນ:', error);
  } finally {
    process.exit();
  }
}

testConnection();