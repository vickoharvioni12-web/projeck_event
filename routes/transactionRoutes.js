const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getMyTransactions, 
  getAllTransactions, 
  updateTransactionStatus,
  getDashboardSummary,
  getAdminAttendees,
  updateCheckInStatus
} = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTransaction);
router.get('/my-transactions', verifyToken, getMyTransactions);

router.get('/dashboard-summary', verifyToken, getDashboardSummary);

// Route untuk Attendees
router.get('/admin/attendees', verifyToken, getAdminAttendees);
router.put('/admin/attendees/:id/checkin', verifyToken, updateCheckInStatus);

router.get('/', verifyToken, getAllTransactions);
router.put('/:id/status', verifyToken, updateTransactionStatus);

module.exports = router;