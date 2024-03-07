// reviews routes

const express = require('express');

const {
  createReview,
  getReviewsForUser,
} = require('../controllers/reviewsController');
const { isPassenger } = require('../middleware');
const router = express.Router();

// Reviews routes
router.post('/', isPassenger, createReview);

router.get('/:userId', getReviewsForUser);

module.exports = router;
