// authenticateUser.js
const { User } = require('../models');

const decryptData = async token => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error(new Error(`decryptData: ${error.message}`));
    return null;
  }
};
const authenticateUser = async (token) => {
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
