// trips routes
const express = require('express');
const {
  addTrip,
  getTrips,
  getOneTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
} = require('../controllers/tripsController');
const { isDriver } = require('../middleware');

const router = express.Router();

// Trips routes
router.post('/', isDriver, addTrip);
router.get('/', getTrips);
router.get('/:id', getOneTrip);
router.put('/:id', isDriver, updateTrip);
router.delete('/:id', deleteTrip);
router.post('/search', searchTrips);

module.exports = router;
