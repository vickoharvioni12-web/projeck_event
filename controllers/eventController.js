const db = require('../config/db');

const getAllEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT e.*, t.nama_category, t.harga, t.stok 
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

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent
};