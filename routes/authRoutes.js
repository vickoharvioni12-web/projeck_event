const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Endpoint Register: POST /api/auth/register
router.post('/register', authController.register);

// Endpoint Login: POST /api/auth/login
router.post('/login', authController.login);

// Endpoint Fetch Users: GET /api/auth/users
router.get('/users', verifyToken, verifyRole(['admin']), authController.getAllUsers);

module.exports = router;