const { User, Subscription } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../helpers/notifications');
const sendEmail = require('../helpers/sendEmail');
const logger = require('../../loggerConfigs');
const { validateFields } = require('../utils');

// Add subscription
const addSubscription = async (req, res) => {
  const { userId, startDate, endDate } = req.body;

  try {
    // Validate input data
    const requiredFields = ['userId', 'startDate', 'endDate'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      logger.error(
        `Adding Subscription: Required fields are missing:${missingFields.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // check if userId exists
    const user = await User.findByPk(userId);
    if (!user) {
      logger.error(`Adding Subscription: User with ID ${userId} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found.',
      });
    }
    // Check if the user has already a subscription
    const subscriptionExists = await Subscription.findOne({
      where: { userId },
    });

    if (subscriptionExists) {
      logger.error(`Adding subscription: Subscription already exists`);
      return res.status(409).json({
        ok: false,
        message: 'The subscription already exists.',
      });
    }

    const subscriptionData = {
      userId,
      startDate,
      endDate,
    };

    // Create the new subscription
    const newSubscription = await Subscription.create(subscriptionData);
    logger.info(`Adding subscription: subscription created successfully`);
    // Send a notification to the user
    createNotification(
      userId,
      'Your trial period has ended. Your subscription is now active.',
      'Subscription Activated'
    );
    sendEmail(
      'SubscriptionActivated',
      'RwandaShareRide - Subscription Activated',
      {
        email: user.email,
        fname: user.fname,
        lname: user.lname,
      }
    );
    // send email to the user
    sendEmail('New subscription ', 'RwandaShareRIde - New Subs', {});
    return res.status(201).json({
      ok: true,
      message: 'subscription created successfully',
      data: newSubscription,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Adding Subscription: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Retrieve subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fname', 'lname', 'email', 'phone'],
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      data: subscriptions,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Retrieving subscriptions: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
// Retrieve one subscription
const getOneSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      logger.error(
        `Fetching one subscription: Subscription with ID ${id} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Subscription not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      data: subscription,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Fetching a subscription: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, startDate, endDate } = req.body;

    // Check if the subscription exists
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      logger.error(
        `Updating a subscription: Subscription with ID ${id} not found`
      );
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
      });
    }

    // Update fields if provided
    if (userId) subscription.userId = userId;
    if (startDate) subscription.startDate = startDate;
    if (endDate) subscription.endDate = endDate;

    // Save changes to the subscription
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription successfully updated',
      data: subscription,
    });
  } catch (error) {
    logger.error(`Updating subscription: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete subscription
const deleteSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      logger.error(
        `Deleting a subscription: Subscription with ID ${id} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Subscription not found',
      });
    }

    // Delete the subscription
    await subscription.destroy();
    return res.status(200).json({
      ok: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a subscription: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

module.exports = {
  addSubscription,
  getSubscriptions,
  getOneSubscription,
  updateSubscription,
  deleteSubscription,
};
