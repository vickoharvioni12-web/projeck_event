const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const verifyToken = authMiddleware.verifyToken || authMiddleware;
const verifyRole = authMiddleware.verifyRole; 

const createTransaction = transactionController.createTransaction;
const getMyTransactions = transactionController.getMyTransactions;
const getAllTransactions = transactionController.getAllTransactions; 
const updateTransactionStatus = transactionController.updateTransactionStatus; 
router.post('/buy', verifyToken, createTransaction);
router.get('/my-orders', verifyToken, getMyTransactions);

router.get('/admin/all', verifyToken, verifyRole(['admin']), getAllTransactions);
router.patch('/admin/:id/status', verifyToken, verifyRole(['admin']), updateTransactionStatus);

module.exports = router;