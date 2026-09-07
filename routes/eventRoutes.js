const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware'); 

const { getAllEvents, createEvent, updateEvent, deleteEvent } = eventController;

if (typeof getAllEvents !== 'function' || typeof updateEvent !== 'function') {
  console.error('CRITICAL ERROR: Ada fungsi di eventController yang belum ter-export dengan benar!');
}

router.get('/', getAllEvents);

router.post('/', verifyToken, upload.single('poster'), createEvent);
router.put('/:id', verifyToken, upload.single('poster'), updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

module.exports = router;