const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

const getAllEvents = eventController.getAllEvents;

if (typeof getAllEvents !== 'function') {
  console.error('CRITICAL ERROR: getAllEvents di eventController bukan fungsi!');
}

router.get('/', getAllEvents);

module.exports = router;