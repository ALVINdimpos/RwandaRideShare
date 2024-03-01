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

const isAdmin = (req, res, next) => {
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

        if (!userRoles || !Array.isArray(userRoles)) {
          logger.error('User roles are not properly defined.');
          return res.status(403).json({
            message: 'Forbidden: User roles are not properly defined.',
          });
        }

        const hashAdminRoleName = hashData('Admin');
        const isAdminRole = userRoles.some(roleObj => {
          return roleObj.nameIndex === hashAdminRoleName;
        });

        if (!isAdminRole) {
          logger.warn('Access denied: User does not have admin role.');
          return res.status(403).json({
            message: 'Forbidden: Only users with admin role are authorized.',
          });
        }

        next();
      }
    );
  } catch (error) {
    logger.error(`isAdmin Middleware: ${error.message}`);
    return res.status(500).json({
      message:
        'Internal Server Error: An error occurred while processing the request.',
    });
  }
};

module.exports = isAdmin;
