const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', verifyToken, verifyRole(['admin']), authController.getAllUsers);

module.exports = router;