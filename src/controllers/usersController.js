const { Op } = require('sequelize');
const { User, Role, ResetPasswordToken } = require('../models');
const crypto = require('crypto');
const logger = require('../../loggerConfigs');
const sendEmail = require('../helpers/sendEmail');

const {
  encryptData,
  hashData,
  validateEmail,
  validatePassword,
  validateFields,
  hashPassword,
} = require('../utils');

// Add user
const addUser = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      roleId,
      password,
      phone,
      isDriver,
      driverLicense,
    } = req.body;

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
      logger.error(
        `Adding User: Required fields are missing: ${missingFields.join(', ')}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
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
      isDriver,
      driverLicense: isDriver ? driverLicense : null,
      isVerified: false, 
      isPasswordChanged: false,
      createdAt: new Date(),
    };

    const user = await User.create(encryptedUserData);
    await user.addRole(role);

    sendEmail(
      'SignUp',
      'Welcome to RwandaRideShare - Set Up Your Profile Password',
      {
        email,
        fname,
        lname,
      }
    );

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
    const { id } = req.params;
    const { fname, lname, roleId, status } = req.body;

    // Check if the user exists
    const user = await User.findByPk(id);
    if (!user) {
      logger.error(`Updating a user: User with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update fields if provided
    if (fname) user.fname = encryptData(fname);
    if (lname) user.lname = encryptData(lname);
    if (status) user.status = status;

    // Find and update the role
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        logger.error(`Updating a user: Role with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Use the association methods to update the user's roles
      await user.setRoles(role);
    }

    // Save changes to the user
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User successfully updated',
      data: user,
    });
  } catch (error) {
    logger.error(`Updating user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the user.',
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

    sendEmail(
      'ResetPassword',
      'RwandaRideShare - Reset Your Password',
      {
        email,
        fname: user.fname,
        lname: user.lname,
        token,
      }
    );

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
}
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

module.exports = {
  addUser,
  getUsers,
  getOneUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
};
