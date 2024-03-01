const { Reviews, User, } = require('../models');
const logger = require('../../loggerConfigs');
const {createNotification} = require('../helpers/notifications');
// Create a review
const createReview = async (req, res) => {
  try {
    // Extract review details from the request body
    const { ReviewedUserID, Rating, Comment } = req.body;
    const { userId } = req;

    // Validate if required fields are present
    const requiredFields = ['ReviewedUserID', 'Rating', 'Comment'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      logger.error(
        `Creating Review: Required fields are missing: ${missingFields.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // Check if the reviewed user exists
    const reviewedUser = await User.findByPk(ReviewedUserID);
    if (!reviewedUser) {
      logger.error(
        `Creating Review: Reviewed user with ID ${ReviewedUserID} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Reviewed user not found',
      });
    }

    // Check if the reviewer (User) exists
    const reviewer = await User.findByPk(userId);
    if (!reviewer) {
      logger.error(`Creating Review: Reviewer with ID ${userId} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Reviewer not found',
      });
    }

    // Create a new review
    const review = await Reviews.create({
      ReviewedUserID,
      ReviewerID: userId,
      Rating,
      Comment,
    });
  
    // create notification
    await createNotification(ReviewedUserID, `You have a new review from ${reviewer.fname} ${reviewer.lname}`, 'Review');

    logger.info('Review successfully created');
    logger.info('Notification created successfully');

    return res.status(201).json({
      ok: true,
      message: 'Review successfully created',
      data: review,
    });
  } catch (error) {
    logger.error(`Creating review: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while creating the review.',
    });
  }
};

// Retrieve reviews for a user
const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      logger.error(
        `Retrieving reviews for a user: User with ID ${userId} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }

    // Retrieve reviews for the user
    const userReviews = await Reviews.findAll({
      where: {
        ReviewedUserID: userId,
      },
      include: [
        {
          model: User,
          as: 'reviewedUser',
        },
        {
          model: User,
          as: 'reviewer',
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      data: userReviews,
    });
  } catch (error) {
    logger.error(`Retrieving reviews for a user: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
module.exports = {
  createReview,
  getReviewsForUser,
};
