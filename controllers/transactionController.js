const db = require('../config/db');

const createTransaction = async (req, res) => {
};

const getMyTransactions = async (req, res) => {
};

const getAllTransactions = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT t.transaction_id, t.user_id, t.ticket_id, t.jumlah_ticket, 
             t.total_harga, t.metode_pembayaran, t.status_pembayaran, t.created_at,
             tk.nama_category
      FROM transaction_order t
      LEFT JOIN ticket tk ON t.ticket_id = tk.ticket_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      query += ` AND t.status_pembayaran = ?`;
      queryParams.push(status);
    }

    if (search) {
      query += ` AND (t.transaction_id LIKE ? OR t.user_id LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limitNum, offset);

    const [orders] = await db.query(query, queryParams);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total_data: orders.length,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransactionStatus = async (req, res) => {
};

const getDashboardSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(CASE WHEN status_pembayaran = 'paid' THEN 1 END) AS total_transaksi_berhasil,
        COALESCE(SUM(CASE WHEN status_pembayaran = 'paid' THEN total_harga ELSE 0 END), 0) AS total_pendapatan,
        COALESCE(SUM(CASE WHEN status_pembayaran = 'paid' THEN jumlah_ticket ELSE 0 END), 0) AS total_tiket_terjual,
        COUNT(CASE WHEN status_pembayaran = 'pending' THEN 1 END) AS total_pending
      FROM transaction_order
    `;

    const [summary] = await db.query(query);

    return res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
  getDashboardSummary
};