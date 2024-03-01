const { UserTag } = require('../models');
const logger = require('../../loggerConfigs');

// Generate Security Pin
const createPIN = async (req, res) => {
  const { userId } = req.params;
  const { pin } = req.body;

  try {
    // Find the userId in UserTag
    const userTag = await UserTag.findOne({ where: { userId } });

    if (!userTag) {
      logger.error(`Retrieving a userTag: User tag not found`);
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    // Generate PIN
    await userTag.update({ pinCode: pin });
    logger.info(`Security pin generated for user ${userId}`);
    return res
      .status(200)
      .json({ ok: true, message: 'Security pin generated' });
  } catch (error) {
    logger.error(`Error generating security pin: ${error.message}`);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error' });
  }
};

// Enable Security
const enableSecurity = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the userId in UserTag (Assuming you want to enable security for a specific user)
    const userTag = await UserTag.findOne({ where: { userId } });

    if (!userTag) {
      logger.error(`Retrieving a userTag: User tag not found`);
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    // Enable security
    await userTag.update({ securityEnabled: true });
    logger.info(`Security enabled for user ${userId}`);
    return res.status(200).json({ ok: true, message: 'Security enabled' });
  } catch (error) {
    logger.error(`Error enabling security: ${error.message}`);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error' });
  }
};

// Disable Security
const disableSecurity = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the userId in UserTag
    const userTag = await UserTag.findOne({ where: { userId } });

    if (!userTag) {
      logger.error(`Retrieving a userTag: User tag not found`);
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    // Enable security
    await userTag.update({ securityEnabled: false });
    logger.info(`Security disabled for user ${userId}`);
    return res.status(200).json({ ok: true, message: 'Security disabled' });
  } catch (error) {
    logger.error(`Error disabling security: ${error.message}`);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error' });
  }
};

// Verify PIN
const verifyPin = async (req, res) => {
  const { userId } = req.params;
  const { pin } = req.body;

  try {
    // Find the userId in UserTag
    const userTag = await UserTag.findOne({ where: { userId } });

    if (!userTag) {
      logger.error(`Retrieving a userTag: User tag not found`);
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    if (userTag.securityEnabled) {
      if (!pin || pin !== userTag.pinCode) {
        return res.status(401).json({
          ok: false,
          message: 'Incorrect pin code. Access denied.',
        });
      }
    }
    // update pin verification status
    await userTag.update({ isPinVerified: true });
    return res.status(200).json({
      ok: true,
      message: 'PIN verified successfully',
    });
  } catch (error) {
    logger.error(`Verifying PIN: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createPIN,
  enableSecurity,
  disableSecurity,
  verifyPin,
};
