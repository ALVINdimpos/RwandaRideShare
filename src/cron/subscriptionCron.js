const cron = require('node-cron');
const { Op } = require('sequelize');
const { Subscription, User } = require('../models');
const { createNotification } = require('../helpers/notifications');
const logger = require('../../loggerConfigs');
const sendEmail = require('../helpers/sendEmail');
const { decryptData } = require('../utils');

const checkSubscriptionEndDates = cron.schedule('0 0 * * *', async () => {
  try {
    const subscriptionsToExpire = await Subscription.findAll({
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
      await Subscription.update(
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
});

module.exports = checkSubscriptionEndDates;
