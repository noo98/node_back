const { Sequelize } = require('sequelize');
const config = require('../config/database');


const sequelize = new Sequelize(
  config.database,
  config.username, 
  config.password, 
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  }
);


async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('ການເຊື່ອມຕໍ່ຖານຂໍ້ມູນສຳເລັດແລ້ວ.');
  } catch (error) {
    console.error('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນໄດ້:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};