const { Notification } = require('../models');
const logger = require('../../loggerConfigs');

const createNotification = async (userId, message, type) => {
  try {
    await Notification.create({
      UserId: userId,
      Message: message,
      Type: type,
    });
    logger.info('Notification created successfully');
  } catch (error) {
    logger.error(`Creating Notification: ${error.message}`);
    throw error; 
  }
};

module.exports = {
  createNotification,
};
