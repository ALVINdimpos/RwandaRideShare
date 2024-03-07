const jwt = require('jsonwebtoken');
const fs = require('fs');
const logger = require('../../loggerConfigs');
const publicKeyPath = process.env.PUBLIC_KEY_PATH;

if (!publicKeyPath) {
  logger.error('Public key paths are not configured.');
  throw new Error('Authentication configuration is not valid.');
}

const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

const isUser = (req, res, next) => {
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
        const userId = decodedToken.userId;

        if (!userId) {
          logger.error('User ID is not properly defined.');
          return res.status(403).json({
            message: 'Forbidden: User ID is not properly defined.',
          });
        }

        req.userId = userId;
        next();
      }
    );
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return res.status(500).json({
      message: 'Internal server error.',
    });
  }
};

module.exports = isUser;
