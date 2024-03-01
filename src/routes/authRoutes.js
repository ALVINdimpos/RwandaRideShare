const express = require('express');

const { login } = require('../controllers/authController');
const {
  forgotPassword,
  resetPassword,
} = require('../controllers/usersController');
const router = express.Router();

// auth related routes
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword', resetPassword);
module.exports = router;
