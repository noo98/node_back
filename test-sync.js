// test-sync.js
const syncDatabase = require('./src/db/sync');

async function testSync() {
  try {
    // ໃຊ້ force: true ເພື່ອລຶບຕາຕະລາງເກົ່າແລະສ້າງໃໝ່
    console.log('ກຳລັງ sync ຖານຂໍ້ມູນ...');
    const result = await syncDatabase(true);
    console.log('ຜົນການ sync:', result);
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການ sync ຖານຂໍ້ມູນ:', error);
  } finally {
    process.exit();
  }
}

testSync();