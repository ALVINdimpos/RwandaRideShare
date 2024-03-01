// request routes
const express = require('express');

const {
  createRequest,
  getAllRequests,
  getOneRequest,
  updateRequestStatus,
  deleteRequest,
} = require('../controllers/requestsController');

const { isPassenger } = require('../middleware');
const router = express.Router();

// Request routes
router.post('/', isPassenger, createRequest);
router.get('/', isPassenger, getAllRequests);
router.get('/:id',  getOneRequest);
router.put('/:id', updateRequestStatus);
router.delete('/:id', isPassenger, deleteRequest);

module.exports = router;