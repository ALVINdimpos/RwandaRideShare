// trips routes
const express = require('express');
const {
  addTrip,
  getTrips,
  getOneTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  getTripsByDriver,
} = require('../controllers/tripsController');
const {
  isDriver,
  isValidUpload,
  checkSubscriptionStatus,
} = require('../middleware');

const router = express.Router();

const fields = [{ name: 'Car', maxCount: 1 }];

// Trips routes
router.get('/driver', isValidUpload(fields), isDriver, getTripsByDriver);
router.post(
  '/',
  isValidUpload(fields),
  checkSubscriptionStatus,
  isDriver,
  addTrip
);
router.get('/', getTrips);
router.get('/:id', getOneTrip);
router.patch('/:id', isValidUpload(fields), isDriver, updateTrip);
router.delete('/:id', deleteTrip);
router.post('/search', searchTrips);

module.exports = router;
