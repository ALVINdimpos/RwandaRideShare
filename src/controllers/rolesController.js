const { Op } = require('sequelize');
const logger = require('../../loggerConfigs');
const { Role, User, Permission } = require('../models');
const {
  validateFields,
  hashData,
  encryptData,
  isArray,
  isEmpty,
} = require('../utils');

// Add role
const addRole = async (req, res) => {
  const { name, display_name, description, permissionIds } = req.body;

  try {
    // Validate input data
    const requiredFields = ['name', 'display_name', 'description'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      logger.error(
        `Adding Role:Required fields are missing:${missingFields.join(', ')}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }
    // Array and emptiness checks for permissionIds
    if (!isArray(permissionIds)) {
      return res.status(400).json({
        ok: false,
        message: 'The permissionIds field must be an array of permission ids',
      });
    }
    if (isEmpty(permissionIds)) {
      return res.status(400).json({
        ok: false,
        message: 'The permissionIds field must not be empty',
      });
    }

    // create nameIndex
    const nameIndex = hashData(name);

    // Check if the role already exists
    const roleExists = await Role.findOne({ where: { nameIndex } });

    if (roleExists) {
      logger.error(`Adding Role: Role with name: ${name} already exists`);
      return res.status(409).json({
        ok: false,
        message: 'The role already exists.',
      });
    }
    const permissions = await Permission.findAll({
      where: { id: permissionIds },
    });

    if (permissions.length !== permissionIds.length) {
      logger.error(`Adding role: One or more permissions not found`);
      return res.status(404).json({
        ok: false,
        message: 'One or more permissions not found',
      });
    }

    const encryptedRoleData = {
      name: encryptData(name),
      display_name: encryptData(display_name),
      description: encryptData(description),
      nameIndex,
    };

    // Create the new role
    const newRole = await Role.create(encryptedRoleData);

    // Attach permissions using the extracted roleId
    await newRole.addPermissions(permissions);
    return res.status(201).json({
      ok: true,
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Adding Role: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error,
    });
  }
};

// Get roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'users',
        },
        {
          model: Permission,
          as: 'permissions',
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      data: roles,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Retrieving roles: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Get user roles
const getUserRoles = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);

    if (!user) {
      logger.error(`Getting user roles: User with id ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found.',
      });
    }

    const roles = await user.getRoles();

    return res.status(200).json({
      ok: true,
      data: roles,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Retrieving roles: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Get One Role
const getOneRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the role exists
    const role = await Role.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
        },
        {
          model: Permission,
          as: 'permissions',
        },
      ],
    });

    if (!role) {
      logger.error(`Fetcing One Role: Role with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Role not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      data: role,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Fetching a role: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_name, permissionIds } = req.body;

    // Check if the role exists
    const role = await Role.findByPk(id);
    if (!role) {
      logger.error(`Updating a role: Role of ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Role not found.',
      });
    }

    // Update fields if provided
    if (name) role.name = name;
    if (display_name) role.display_name = display_name;
    if (description) role.description = description;

    // Find and update the permissions
    if (permissionIds) {
      // Check if all permissions exist
      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });

      if (permissions.length !== permissionIds.length) {
        logger.error(`Updating a role: One or more permissions not found`);
        return res.status(404).json({
          ok: false,
          message: 'One or more permissions not found',
        });
      }

      // Use the association methods to update the role's permissions
      await role.setPermissions(permissions);
    }

    // Save changes to the role
    await role.save();

    return res.status(200).json({
      ok: true,
      message: 'Role successfully updated',
      data: role,
    });
  } catch (error) {
    logger.error(`Updating role: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByPk(id);

    if (!role) {
      logger.error(`Deleting a role: Role with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Role not found',
      });
    }

    // Find the first role in the Role table
    const firstRole = await Role.findOne();

    // Check if the role is the same as the first role (super admin role)
    if (role.id === firstRole.id) {
      logger.error(`Deleting a role: Cannot delete the super admin role`);
      return res.status(403).json({
        ok: false,
        message: 'Cannot delete the super admin role',
      });
    }

    // Delete the role
    await role.destroy();
    return res.status(200).json({
      ok: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a role: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};
// Get archived roles
const getArchivedRoles = async (req, res) => {
  try {
    const archivedRoles = await Role.findAll({
      include: {
        model: User,
        as: 'users',
      },
      paranoid: false,
      where: {
        deletedAt: { [Op.not]: null },
      },
    });

    return res.status(200).json({
      ok: true,
      data: archivedRoles,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Retrieving archived roles: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  addRole,
  getRoles,
  getOneRole,
  updateRole,
  getArchivedRoles,
  deleteRole,
  getUserRoles,
};
