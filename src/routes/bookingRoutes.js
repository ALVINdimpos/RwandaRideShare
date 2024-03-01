// book routes please

const express = require('express');

const {
  createBooking,
  getAllBookingsForTrip,
  getOneBooking,
  updateBookingStatus,
  deleteBooking,
  getDriverBookings,
  processBookingRequest,
} = require('../controllers/bookingController');

const { isPassenger,isDriver } = require('../middleware');
const router = express.Router();

// Drivers routes 
router.get('/driver', isDriver, getDriverBookings);
router.put('/driver/', isDriver, processBookingRequest);
// Bookings routes
router.post('/',isPassenger, createBooking);
router.get('/', isPassenger, getAllBookingsForTrip);
router.get('/:id', isPassenger, getOneBooking);
router.put('/:id', isPassenger, updateBookingStatus);
router.delete('/:id', isPassenger, deleteBooking);




module.exports = router;