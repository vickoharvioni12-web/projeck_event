const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware'); 

const { 
  getAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  createTicket 
} = eventController;

if (
  typeof getAllEvents !== 'function' || 
  typeof updateEvent !== 'function' || 
  typeof createTicket !== 'function'
) {
  console.error('CRITICAL ERROR: Ada fungsi di eventController yang belum ter-export dengan benar!');
}

router.get('/', getAllEvents);
router.post('/', verifyToken, upload.single('poster'), createEvent);
router.put('/:id', verifyToken, upload.single('poster'), updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

router.post('/tickets', verifyToken, createTicket);

module.exports = router;