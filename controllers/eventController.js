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

module.exports = {
  getAllEvents,
};