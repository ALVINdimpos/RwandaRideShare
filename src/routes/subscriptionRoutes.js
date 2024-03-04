const express = require('express');
const {
  addSubscription,
  getSubscriptions,
  getOneSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { isAdmin } = require('../middleware');

const router = express.Router();

// Subscription routes
router.post('/', addSubscription);
router.get('/', getSubscriptions);
router.get('/:id', isAdmin, getOneSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
