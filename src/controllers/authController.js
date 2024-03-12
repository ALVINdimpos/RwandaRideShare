const fs = require('fs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const {
  validateFields,
  validateEmail,
  hashData,
  comparePassword,
  validatePassword,
  formatDateTime,
} = require('../utils');
const logger = require('../../loggerConfigs');

const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

// login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const requiredFields = ['email', 'password'];
    const missingFields = validateFields(req, requiredFields);

    // field validation
    if (missingFields.length > 0) {
      logger.error(
        `Adding User:Required fields are missing:${missingFields.join(', ')}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // email validation
    if (!validateEmail(email)) {
      logger.error(`Adding User: Invalid email:${email}`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid credentials',
        info: 'The email should follow the following partner xxx@xxx.xxx',
      });
    }

    if (!validatePassword(password)) {
      logger.error(`Adding User: Invalid password`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid credentials',
        info: 'Password must be at least 8 characters long and contain at least one capital letter and one digit',
      });
    }

    // check if user exists with email's index
    const emailIndex = hashData(email);
    const user = await User.findOne({
      where: { emailIndex },
      include: {
        model: Role,
        attributes: ['id', 'nameIndex'],
        as: 'roles',
        through: 'UserRole',
      },
    });

    if (!user) {
      logger.error(`Login-email: Invalid credentials from ${email}`);
      return res.status(401).json({
        ok: false,
        message: 'Invalid credentials.',
      });
    }

    // compare passwords
    const comparedHashedPassword = comparePassword(password, user.password);

    if (!comparedHashedPassword) {
      logger.error(`Login-pw: Invalid credentials from ${email}`);
      return res.status(401).json({
        ok: false,
        message: 'Invalid credentials.',
      });
    }

    // token payload
    const tokenPayload = {
      userId: user.id,
      emailIndex: user.emailIndex,
      roles: user.roles,
    };

    // jwt sign-in options
    const signOptions = {
      algorithm: 'RS256',
      expiresIn: '24h',
    };

    // token
    const token = jwt.sign(tokenPayload, privateKey, signOptions);

    return res.status(200).json({
      ok: true,
      loggedInAt: formatDateTime(new Date(), {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
      }),
      token,
    });
  } catch (error) {
    logger.error(`Login: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred during login.',
    });
  }
};

module.exports = { login };
