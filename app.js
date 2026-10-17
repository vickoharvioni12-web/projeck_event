require('dotenv').config(); 
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
});
const PORT = process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 8081;
const HOST = '192.168.69.133';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Backend berjalan di http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('Gagal menjalankan server:', err.message);
});