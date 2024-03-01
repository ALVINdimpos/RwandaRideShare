// notification routes

const express = require('express');
const {
  getUserNotifications,
} = require('../controllers/notificationController');
const { isUser } = require('../middleware');
const router = express.Router();

// Notifications routes
router.get('/',isUser , getUserNotifications);

module.exports = router;
