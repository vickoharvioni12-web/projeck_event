const db = require('../config/db');

const createTransaction = async (req, res) => {
  try {
    return res.json({ success: true, message: "Create transaction endpoint" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    return res.json({ success: true, data: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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
  try {
    return res.json({ success: true, message: "Update transaction status endpoint" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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

const getAdminAttendees = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.transaction_id AS order_id,
        t.transaction_id AS ticket_code,
        u.email,
        e.nama_event AS event_name,
        tk.nama_category AS ticket_category,
        COALESCE(t.status_pembayaran, 'Pending') AS checkin_status
      FROM transaction_order t
      LEFT JOIN user u ON t.user_id = u.user_id
      LEFT JOIN ticket tk ON t.ticket_id = tk.ticket_id
      LEFT JOIN event e ON tk.event_id = e.event_id
    `;
    const [attendees] = await db.query(query);

    const formattedAttendees = attendees.map(item => ({
      ...item,
      user_name: item.email ? item.email.split('@')[0] : `User #${item.order_id}`,
      email: item.email || 'no-email@example.com',
      event_name: item.event_name || 'Unnamed Event',
      ticket_category: item.ticket_category || 'Regular'
    }));

    return res.json({ success: true, data: formattedAttendees });
  } catch (error) {
    console.error('Error getAdminAttendees:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCheckInStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const query = `UPDATE transaction_order SET status_pembayaran = ? WHERE transaction_id = ?`;
    await db.query(query, [status, id]);

    return res.json({ success: true, message: 'Status check-in berhasil diperbarui' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
  getDashboardSummary,
  getAdminAttendees,
  updateCheckInStatus
};