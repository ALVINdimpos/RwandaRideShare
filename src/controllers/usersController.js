const { Op } = require('sequelize');
const { User, Role, ResetPasswordToken } = require('../models');
const crypto = require('crypto');
const logger = require('../../loggerConfigs');
const { createNotification } = require('../helpers/notifications');
const sendEmail = require('../helpers/sendEmail');

const {
  encryptData,
  hashData,
  validateEmail,
  validatePassword,
  validateFields,
  hashPassword,
  cleanUpFiles,
  decryptData,
} = require('../utils');

// Add user
const addUser = async (req, res) => {
  try {
    const { fname, lname, email, roleId, password, phone } = req.body;

    const requiredFields = [
      'fname',
      'lname',
      'email',
      'roleId',
      'password',
      'phone',
    ];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      cleanUpFiles(req, 'images');
      logger.error(
        `Adding User: Required fields are missing: ${missingFields.join(', ')}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }
    if (req.imageUploadError) {
      logger.error(`Adding User: ${req.imageUploadError}`);
      // Clean up uploaded images on error
      cleanUpFiles(req, 'images');
      return res.status(400).json({
        ok: false,
        message: req.imageUploadError,
      });
    }
    if (!validateEmail(email)) {
      logger.error(`Adding User: Invalid email: ${email}`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid email format',
      });
    }

    if (!validatePassword(password)) {
      logger.error(`Adding User: Invalid password`);
      return res.status(400).json({
        ok: false,
        message:
          'Password must be at least 8 characters long and contain at least one capital letter and one digit',
      });
    }

    const emailIndex = hashData(email);
    const existingUser = await User.findOne({ where: { emailIndex } });

    if (existingUser) {
      logger.error(`Adding User: User with email: ${email} exists`);
      return res.status(409).json({
        ok: false,
        message: `User with this email: ${email} already exists.`,
      });
    }

    const role = await Role.findByPk(roleId);

    if (!role) {
      logger.error(`Adding User: Role with ID ${roleId} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Role not found',
      });
    }

    const encryptedUserData = {
      fname: encryptData(fname),
      lname: encryptData(lname),
      phone: encryptData(phone),
      email: encryptData(email),
      emailIndex,
      password: hashPassword(password),
      Avatar: req.files['Avatar'] ? req.files['Avatar'][0].path : null,
      DriverLicense: req.files['DriverLicense']
        ? req.files['DriverLicense'][0].path
        : null,
      isVerified: false,
      isPasswordChanged: false,
      createdAt: new Date(),
    };

    const user = await User.create(encryptedUserData);
    await user.addRole(role);

    // Send role-specific notification
    if (role.nameIndex === hashData('Driver')) {
      createNotification(
        user.id,
        'Hello there! Thank you for creating a driver account with RwandaRideShare. Your account will be reviewed, and you will be notified once it is approved. Safe travels!',
        'Account Created'
      );
      sendEmail('driverCreated', 'RwandaRideShare - Driver Account Created', {
        email: decryptData(email),
        fname: decryptData(fname),
        lname,
      });
    } else {
      sendEmail(
        'passengerCreated','RwandaRideShare - Passenger Account Created',
        {
          email: decryptData(email),
          fname: decryptData(fname),
          lname,
        }
      );

      createNotification(
        user.id,
        'Welcome to RwandaRideShare! You have successfully created a passenger account. Enjoy your journey with us!',
        'Account Created'
      );
    }

    return res.status(201).json({
      ok: true,
      message: 'User successfully added',
      data: user,
    });
  } catch (error) {
    logger.error(`Adding a user: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while adding the user.',
    });
  }
};

// Retrieve users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    logger.info('Users retrieved successfully');
    return res.status(200).json({
      ok: true,
      data: users,
    });
  } catch (error) {
    logger.error(`Retrieving users: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Get one user
const getOneUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'roles',
        },
      ],
    });

    if (!user) {
      logger.error(`Fetching a user: User with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found.',
      });
    } else {
      return res.status(200).json({
        ok: true,
        data: user,
      });
    }
  } catch (error) {
    logger.error(`Fetching a user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user.',
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req;
    const { fname, lname, email, phone } = req.body;

    // Validate if required fields are present
    const requiredFields = ['fname', 'lname', 'email', 'phone'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      cleanUpFiles(req, 'images');
      logger.error(
        `Updating User: Required fields are missing: ${missingFields.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // Check if the user exists
    const user = await User.findOne(userId);

    if (!user) {
      logger.error(`Updating User: User with ID ${userId} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }

    // Update user profile fields
    user.fname = encryptData(fname);
    user.lname = encryptData(lname);
    user.email = encryptData(email);
    user.phone = encryptData(phone);

    // If Avatar and DriverLicense are provided in the request, update them
    if (req.files['Avatar']) {
      user.Avatar = req.files['Avatar'][0].path;
    }

    if (req.files['DriverLicense']) {
      user.DriverLicense = req.files['DriverLicense'][0].path;
    }

    // Save changes to the user
    await user.save();

    return res.status(200).json({
      ok: true,
      message: 'User profile successfully updated',
      data: user,
    });
  } catch (error) {
    logger.error(`Updating a user: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while updating the user profile.',
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      logger.error(`Deleting a user: User with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }

    // Find the first user in the User table
    const firstUser = await User.findOne();

    // Check if the user is the same as the first user (super admin user)
    if (user.id === firstUser.id) {
      logger.error(`Deleting a user: Cannot delete the super admin`);
      return res.status(403).json({
        ok: false,
        message: 'Cannot delete the super admin',
      });
    }

    // Delete the user
    await user.destroy();
    return res.status(200).json({
      ok: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a user: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};
// forgotPassword

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      logger.error(`Forgot Password: Invalid email: ${email}`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid email format',
      });
    }

    const emailIndex = hashData(email);
    const user = await User.findOne({ where: { emailIndex } });
    if (!user) {
      logger.error(`Forgot Password: User with email: ${email} not found`);
      return res.status(404).json({
        ok: false,
        message: `User with email: ${email} not found.`,
      });
    }

    const token = crypto.randomBytes(40).toString('hex');
    const resetPasswordToken = await ResetPasswordToken.create({
      UserId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    sendEmail('ResetPassword', 'RwandaRideShare - Reset Your Password', {
      email : decryptData(user.email),
      fname: decryptData(user.fname),
      lname: user.lname,
      token,
    });

    return res.status(200).json({
      ok: true,
      message: 'Password reset token sent successfully',
      data: resetPasswordToken,
    });
  } catch (error) {
    logger.error(`Forgot Password: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while sending the password reset token.',
    });
  }
};
// resetPassword

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    // Validate email and password...

    const resetPasswordToken = await ResetPasswordToken.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!resetPasswordToken) {
      logger.error(`Reset Password: Invalid or expired token`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid or expired token',
      });
    }

    // Now you can access the associated user
    const user = resetPasswordToken.user;

    // Update the user's password and save
    user.password = hashPassword(password);
    await user.save();
    await resetPasswordToken.destroy();

    logger.info('Password reset successfully');
    return res.status(200).json({
      ok: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error(`Reset Password: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while resetting the password.',
    });
  }
};

const approveUserIfIsDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    const updateResult = await User.update(
      { IsVerified: true },
      {
        where: {
          id,
        },
      }
    );
    if (updateResult) {
      // Log success
      logger.info(`User with ID ${id} approved successfully`);
      // Send email to the user
      sendEmail('driverApproved', 'RwandaRideShare - Driver Account Approved', {
        email: decryptData(user.email),
        fname: decryptData(user.fname),
        lname: user.lname,
      });
      // Send notification to the user
      createNotification(
        user.id,
        'Hello there! Your driver account has been successfully approved! 🚗✨ You can now enjoy full access to our platform and start offering rides or find trips to join. Safe travels!',
        'Account Approved'
      );

      return res.status(200).json({
        ok: true,
        message: 'User approved successfully',
        data: user,
      });
    } else {
      // Log failure
      logger.error(`User approval failed. User with ID ${id} not found`);

      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    // Log error
    logger.error(`Error approving user: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  addUser,
  getUsers,
  getOneUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  approveUserIfIsDriver,
};
