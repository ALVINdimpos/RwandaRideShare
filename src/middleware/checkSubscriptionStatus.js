const jwt = require('jsonwebtoken');
const fs = require('fs');
const logger = require('../../loggerConfigs');
const { hashData } = require('../utils');
const { UserSubscription } = require('../models');

const publicKeyPath = process.env.PUBLIC_KEY_PATH;

if (!publicKeyPath) {
  logger.error('Public key paths are not configured.');
  throw new Error('Authentication configuration is not valid.');
}

const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

// This middleware checks if the user has an active subscription

const checkSubscriptionStatus = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Unauthorized: No token provided.',
      });
    }

    const token = authHeader;

    jwt.verify(
      token,
      publicKey,
      { algorithms: ['RS256'] },
      async (err, decodedToken) => {
        if (err) {
          logger.error(`JWT verification error: ${err.message}`);
          return res.status(401).json({
            message: 'Unauthorized: Your token is invalid or expired.',
          });
        }

        const userId = decodedToken.userId;

        const userSubscription = await UserSubscription.findOne({
          where: {
            userId,
            status: 'Active',
          },
        });

        if (!userSubscription) {
          return res.status(403).json({
            ok: false,
            message:
              'Subscription expired. Please renew your subscription to continue.',
          });
        }

        next();
      }
    );
  } catch (error) {
    logger.error(`Error in checkSubscriptionStatus: ${error.message}`);
    return res.status(500).json({
      message: 'Internal server error.',
    });
  }
};

module.exports = checkSubscriptionStatus;
