const isAdmin = require('./isAdmin.js');
const isDriver = require('./isDriver.js');
const isPassenger = require('./isPassenger.js');
const isValidUpload = require('./isValidUpload.js');
const isUser = require('./isUser.js');
const checkSubscriptionStatus = require('./checkSubscriptionStatus.js');

module.exports = {
  isAdmin,
  isDriver,
  isPassenger,
  isValidUpload,
  isUser,
  checkSubscriptionStatus,
};
