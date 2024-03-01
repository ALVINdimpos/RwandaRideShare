const express = require('express');
const {
  createPIN,
  enableSecurity,
  disableSecurity,
  verifyPin,
} = require('../controllers/securityController');

const router = express.Router();

// Secury routes

router.post('/create-pin/:userId', createPIN);

router.get('/enable/:userId', enableSecurity);

router.get('/disable/:userId', disableSecurity);

router.post('/verify-pin/:userId', verifyPin);
module.exports = router;
