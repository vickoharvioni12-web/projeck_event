const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { user_name, email, password, no_telepon, role } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO user (user_name, email, password, no_telepon, role) VALUES (?, ?, ?, ?, ?)',
      [user_name, email, hashedPassword, no_telepon || null, role || 'user']
    );

    return res.status(201).json({ success: true, message: 'Registrasi berhasil!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan!' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password salah!' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id, user_name, email, no_telepon, role, created_at FROM user');
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
};