const db = require('../config/db');

const getAllEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT 
        e.event_id,
        e.nama_event,
        e.deskripsi,
        e.tanggal_pembelian_mulai,
        e.tanggal_pembelian_selesai,
        e.poster,
        MIN(t.harga) AS harga_mulai,
        COALESCE(SUM(t.stok), 0) AS total_stok
      FROM event e
      LEFT JOIN ticket t ON e.event_id = t.event_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      query += ` AND e.nama_event LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    if (category) {
      query += ` AND t.nama_category = ?`;
      queryParams.push(category);
    }

    query += ` GROUP BY e.event_id, e.nama_event, e.deskripsi, e.tanggal_pembelian_mulai, e.tanggal_pembelian_selesai, e.poster`;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY e.tanggal_pembelian_mulai DESC LIMIT ? OFFSET ?`;
    queryParams.push(limitNum, offset);

    const [events] = await db.query(query, queryParams);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      data: events
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { nama_event, deskripsi, tanggal_pembelian_mulai, tanggal_pembelian_selesai } = req.body;
    const poster = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO event (nama_event, deskripsi, tanggal_pembelian_mulai, tanggal_pembelian_selesai, poster) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      nama_event, 
      deskripsi, 
      tanggal_pembelian_mulai, 
      tanggal_pembelian_selesai, 
      poster
    ]);

    return res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat',
      data: {
        event_id: result.insertId,
        nama_event,
        poster_url: poster ? `${req.protocol}://${req.get('host')}/uploads/${poster}` : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_event, deskripsi, tanggal_pembelian_mulai, tanggal_pembelian_selesai } = req.body;
    const poster = req.file ? req.file.filename : null;

    let query = `
      UPDATE event 
      SET nama_event = ?, deskripsi = ?, tanggal_pembelian_mulai = ?, tanggal_pembelian_selesai = ?
    `;
    const queryParams = [nama_event, deskripsi, tanggal_pembelian_mulai, tanggal_pembelian_selesai];

    if (poster) {
      query += `, poster = ?`;
      queryParams.push(poster);
    }

    query += ` WHERE event_id = ?`;
    queryParams.push(id);

    const [result] = await db.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }

    return res.json({
      success: true,
      message: 'Event berhasil diperbarui'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM event WHERE event_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }

    return res.json({
      success: true,
      message: 'Event berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTicket = async (req, res) => {
  const { event_id, nama_category, harga, stok } = req.body;

  try {
    const [existingEvent] = await db.query('SELECT * FROM event WHERE event_id = ?', [event_id]);
    if (existingEvent.length === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan!' });
    }

    const [result] = await db.query(
      'INSERT INTO ticket (event_id, nama_category, harga, stok) VALUES (?, ?, ?, ?)',
      [event_id, nama_category, harga, stok]
    );

    return res.status(201).json({
      success: true,
      message: 'Tiket berhasil ditambahkan!',
      data: {
        ticket_id: result.insertId,
        event_id,
        nama_category,
        harga,
        stok
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminTickets = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.ticket_id,
        e.nama_event AS event_name,
        t.nama_category AS category,
        t.harga AS price,
        t.stok AS quota,
        0 AS sold
      FROM ticket t
      JOIN event e ON t.event_id = e.event_id
      ORDER BY t.ticket_id DESC
    `;
    
    const [tickets] = await db.query(query);
    return res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_category, harga, stok } = req.body;

    const query = `
      UPDATE ticket 
      SET nama_category = ?, harga = ?, stok = ? 
      WHERE ticket_id = ?
    `;

    const [result] = await db.query(query, [nama_category, harga, stok, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
    }

    return res.json({
      success: true,
      message: 'Tiket berhasil diperbarui'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM ticket WHERE ticket_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
    }

    return res.json({
      success: true,
      message: 'Tiket berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createTicket,
  getAdminTickets,
  updateTicket,
  deleteTicket
};