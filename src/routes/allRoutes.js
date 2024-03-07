// imports
const express = require('express');

const usersRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const securityRoutes = require('./securityRoutes');
const tripsRoutes = require('./tripsRoutes');
const bookingsRoutes = require('./bookingRoutes');
const reviewsRoutes = require('./reviewRoutes');
const requestsRoutes = require('./requestRoutes');
const notificationsRoutes = require('./notificationRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const contactusRoutes = require('./contactusRoutes');
// router instance
const router = express.Router();

// all routes
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/security', securityRoutes);
router.use('/trips', tripsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/requests', requestsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/contact-us', contactusRoutes);

// export
module.exports = router;
