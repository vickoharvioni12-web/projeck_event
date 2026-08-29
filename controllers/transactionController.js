const db = require('../config/db');

const createTransaction = async (req, res) => {
  const { ticket_id, quantity, metode_pembayaran } = req.body;
  const user_id = req.user?.user_id || req.user?.id || req.user?.id_user;

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: 'User ID tidak ditemukan dalam token! Silakan login ulang.'
    });
  }

  if (!ticket_id || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'ticket_id dan quantity wajib diisi!'
    });
  }

  const qty = Number(quantity);

  try {
    const [tickets] = await db.query('SELECT * FROM ticket WHERE ticket_id = ?', [ticket_id]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan!' });
    }

    const ticket = tickets[0];
    const price = Number(ticket.harga);
    const stok = Number(ticket.stok);

    if (stok < qty) {
      return res.status(400).json({ success: false, message: 'Kuota tiket tidak mencukupi!' });
    }

    const total_harga = price * qty;
    const metode = metode_pembayaran || 'transfer';

    const [result] = await db.query(
      `INSERT INTO transaction_order 
       (user_id, ticket_id, jumlah_ticket, total_harga, metode_pembayaran, status_pembayaran) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, ticket_id, qty, total_harga, metode, 'pending']
    );

    await db.query('UPDATE ticket SET stok = stok - ? WHERE ticket_id = ?', [qty, ticket_id]);

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat!',
      data: {
        transaction_id: result.insertId,
        user_id,
        ticket_id,
        jumlah_ticket: qty,
        total_harga,
        metode_pembayaran: metode,
        status_pembayaran: 'pending'
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTransactions = async (req, res) => {
  const user_id = req.user?.user_id || req.user?.id || req.user?.id_user;
  
  try {
    const [orders] = await db.query(
      `SELECT transaction_id, user_id, ticket_id, jumlah_ticket, total_harga, metode_pembayaran, status_pembayaran, created_at
       FROM transaction_order
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT transaction_id, user_id, ticket_id, jumlah_ticket, total_harga, metode_pembayaran, status_pembayaran, created_at
       FROM transaction_order
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { status_pembayaran } = req.body;

  if (!status_pembayaran) {
    return res.status(400).json({
      success: false,
      message: 'status_pembayaran wajib diisi! (contoh: paid, cancelled, pending)'
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE transaction_order SET status_pembayaran = ? WHERE transaction_id = ?`,
      [status_pembayaran, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan!' });
    }

    return res.json({
      success: true,
      message: `Status transaksi ID ${id} berhasil diubah menjadi '${status_pembayaran}'`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus
};