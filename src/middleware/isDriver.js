const jwt = require('jsonwebtoken');
const fs = require('fs');
const logger = require('../../loggerConfigs');
const { hashData } = require('../utils');

const publicKeyPath = process.env.PUBLIC_KEY_PATH;

if (!publicKeyPath) {
  logger.error('Public key paths are not configured.');
  throw new Error('Authentication configuration is not valid.');
}

const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

const isDriver = (req, res, next) => {
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
        (err, decodedToken) => {
        if (err) {
          logger.error(`JWT verification error: ${err.message}`);
          return res.status(401).json({
            message: 'Unauthorized: Your token is invalid or expired.',
          });
        }

            const userRoles = decodedToken.roles;
       const UserID = decodedToken.userId;
        if (!userRoles || !Array.isArray(userRoles)) {
          logger.error('User roles are not properly defined.');
          return res.status(403).json({
            message: 'Forbidden: User roles are not properly defined.',
          });
        }

        const hashDriverRoleName = hashData('Driver');
        const isDriverRole = userRoles.some(roleObj => {
          return roleObj.nameIndex === hashDriverRoleName;
        });

        if (!isDriverRole) {
          logger.warn('Access denied: User does not have Driver role.');
          return res.status(403).json({
            message: 'Forbidden: Only users with Driver role are authorized.',
          });
        }
        req.userId = UserID;
        next();
      }
    );
  } catch (error) {
    logger.error(`isDriver Middleware: ${error.message}`);
    return res.status(500).json({
      message:
        'Internal Server Error: An error occurred while processing the request.',
    });
  }
};

module.exports = isDriver;
