const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

// Konfigurasi CORS agar mengizinkan request dari frontend
app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder statis untuk file upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
});

// Menggunakan PORT 3000 agar sesuai dengan Vite Proxy & Firewall
const PORT = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Bind ke '0.0.0.0' agar backend bisa diakses dari jaringan LAN (PC A)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Backend berjalan di http://192.168.69.133:${PORT}`);
});

server.on('error', (err) => {
  console.error('Gagal menjalankan server:', err.message);
});