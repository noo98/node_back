require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./src/db/connection');
const authRoutes = require('./src/routes/auth.routes');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ບໍ່ໄດ້ຮັບອະນຸຍາດ, ກະລຸນາເຂົ້າສູ່ລະບົບ'
    });
  }

  req.user = { id: 1, role: 'admin' };
  next();
};

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log('API:',`${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'ບໍ່ພົບເສັ້ນທາງທີ່ຮ້ອງຂໍ'
  });
});

app.use((err, req, res, next) => {
  console.error('ຂໍ້ຜິດພາດ:', err);
  res.status(500).json({
    success: false,
    message: 'ເກີດຂໍ້ຜິດພາດຈາກເຊີເວີ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function startServer() {
  try {
    console.log('ກຳລັງພະຍາຍາມເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນ...');
    console.log('DB Config:', {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'BOD',
      user: process.env.DB_USER || 'postgres',
      port: process.env.DB_PORT || '5432'
    });

    await sequelize.authenticate();
    console.log('ການເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນສຳເລັດແລ້ວ!');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();