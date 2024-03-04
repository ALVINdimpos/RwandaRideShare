const cron = require('node-cron');
const { Op } = require('sequelize');
const { UserSubscription, User } = require('../models');
const { createNotification } = require('../helpers/notifications');
const logger = require('../../loggerConfigs');
const sendEmail = require('../helpers/sendEmail');
const { decryptData } = require('../utils');

const checkSubscriptionEndDates = async () => {
  try {
    const subscriptionsToExpire = await UserSubscription.findAll({
      where: {
        endDate: {
          [Op.lt]: new Date(),
        },
        status: {
          [Op.ne]: 'Expired',
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fname', 'lname'],
        },
      ],
    });

    subscriptionsToExpire.forEach(async subscription => {
      const { userId, endDate, user } = subscription;

      // Send email notification
      sendEmail(
        'subscriptionExpired',
        'RwandaShareRide - Subscription Expired',
        {
          email: decryptData(user.email),
          fname: decryptData(user.fname),
          lname: decryptData(user.lname),
        }
      );

      // Send notification to the user
      createNotification(
        userId,
        'Your subscription has expired. Please renew your subscription.',
        'Subscription Expired'
      );

      // Update subscription status to 'Expired'
      await UserSubscription.update(
        { status: 'Expired' },
        {
          where: {
            userId,
            endDate,
          },
        }
      );
    });
    logger.info('Subscription end dates checked successfully');
    return true;
  } catch (error) {
    logger.error(error);
  }
};

// Schedule the cron job to run every day at a specific time (e.g., midnight)
cron.schedule('0 0 * * *', () => {
  checkSubscriptionEndDates();
});

module.exports = cron;
