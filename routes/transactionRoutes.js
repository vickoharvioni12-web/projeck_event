const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/authMiddleware'); // sesuaikan nama middleware JWT kamu

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/my-transactions', verifyToken, transactionController.getMyTransactions);
router.get('/', verifyToken, transactionController.getAllTransactions);
router.put('/:id/status', verifyToken, transactionController.updateTransactionStatus);

module.exports = router;