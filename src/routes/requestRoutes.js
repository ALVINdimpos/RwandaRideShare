// request routes
const express = require('express');

const {
  createRequest,
  getAllRequests,
  getOneRequest,
  takeAndApproveRequest,
} = require('../controllers/requestsController');

const { isPassenger,isDriver } = require('../middleware');
const router = express.Router();

// Request routes
router.post('/', isPassenger, createRequest);
router.get('/', isPassenger, getAllRequests);
router.get('/:id', isPassenger, getOneRequest);
router.put('/takeAndApprove/:requestId', isDriver, takeAndApproveRequest);

module.exports = router;