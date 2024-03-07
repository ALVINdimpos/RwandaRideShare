// authenticateUser.js
const { User } = require('../models');
const logger = require('../../loggerConfigs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const decryptData = async token => {
  const publicKey = fs.readFileSync('public_key.pem');
  try {
    const decoded = jwt.verify(token, publicKey);
    return decoded;
  } catch (error) {
    logger.error(new Error(`decryptData: ${error.message}`));
    return null;
  }
};
const authenticateUser = async token => {
  try {
    const decoded = await decryptData(token);
    const { userId } = decoded;
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    return user.id;
  } catch (error) {
    logger.error(new Error(`authenticateUser: ${error.message}`));
    return null;
  }
};

exports.authenticateUser = authenticateUser;

// the below code fragment can be found in:
// src/controllers/subscriptionController.js
