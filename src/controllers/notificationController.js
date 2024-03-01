const { Notification } = require('../models');
const logger = require('../../loggerConfigs');

// Controller to get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req;

    // Check if the user has any notifications
    const userHasNotifications = await Notification.findOne({
      where: {
        UserId: userId,
      },
    });

    if (!userHasNotifications) {
      logger.warn('No notifications found for the user');
      return res.status(404).json({
        ok: false,
        message: 'No notifications found for the user.',
      });
    }

    // Retrieve notifications for the user
    const notifications = await Notification.findAll({
      where: {
        UserId: userId,
      },
      order: [['createdAt', 'DESC']],
    });

    // Mark notifications as read
    await Notification.update(
      { IsRead: true },
      {
        where: {
          UserId: userId,
          IsRead: false,
        },
      }
    );

    logger.info('Notifications retrieved successfully');

    return res.status(200).json({
      ok: true,
      data: notifications,
    });
  } catch (error) {
    logger.error(`Retrieving notifications: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while retrieving notifications.',
    });
  }
};

module.exports = {
  getUserNotifications,
};
