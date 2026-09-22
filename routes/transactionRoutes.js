const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getMyTransactions, 
  getAllTransactions, 
  updateTransactionStatus,
  getDashboardSummary 
} = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTransaction);
router.get('/my-transactions', verifyToken, getMyTransactions);

// Taruh endpoint ini di atas '/'
router.get('/dashboard-summary', verifyToken, getDashboardSummary);

router.get('/', verifyToken, getAllTransactions);
router.put('/:id/status', verifyToken, updateTransactionStatus);

module.exports = router;