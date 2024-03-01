const express = require('express');

const { login } = require('../controllers/authController');

const router = express.Router();

// auth related routes
router.post('/login', login);

module.exports = router;
