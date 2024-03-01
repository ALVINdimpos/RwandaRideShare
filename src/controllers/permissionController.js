const logger = require('../../loggerConfigs');
const { Permission } = require('../models');
const { validateFields, hashData, encryptData } = require('../utils');

// CRUD operations for permissions

// Add permission
const addPermission = async (req, res) => {
  const { name, display_name, description } = req.body;

  try {
    // Validate input data
    const requiredFields = ['name', 'display_name', 'description'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      logger.error(
        `Adding Permission:Required fields are missing:${missingFields.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }
    // create nameIndex
    const nameIndex = hashData(name);

    // Check if the permission already exists
    const permissionExists = await Permission.findOne({ where: { nameIndex } });

    if (permissionExists) {
      logger.error(
        `Adding Permission: Permission with name: ${name} already exists`
      );
      return res.status(409).json({
        ok: false,
        message: 'The permission already exists.',
      });
    }

    const encryptedPermissionData = {
      name: encryptData(name),
      display_name: encryptData(display_name),
      description: encryptData(description),
      nameIndex,
    };

    // Create the new permission
    const newPermission = await Permission.create(encryptedPermissionData);

    return res.status(201).json({
      ok: true,
      message: 'Permission created successfully',
      data: newPermission,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Adding Permission: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();

    return res.status(200).json({
      ok: true,
      data: permissions,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Getting Permissions: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Get a single permission

const getPermission = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      logger.error(`Getting Permission: Permission with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Permission not found',
      });
    }

    return res.status(200).json({
      ok: true,
      data: permission,
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Getting Permission: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Update a permission

const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name, display_name, description } = req.body;

  try {
    // Check if the permission exists
    const permission = await Permission.findByPk(id);

    if (!permission) {
      logger.error(`Updating Permission: Permission with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Permission not found.',
      });
    }

    const encryptedPermissionData = {
      name: encryptData(name),
      display_name: encryptData(display_name),
      description: encryptData(description),
    };

    // Update the permission
    await Permission.update(encryptedPermissionData, { where: { id } });

    return res.status(200).json({
      ok: true,
      message: 'Permission updated successfully',
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Updating Permission: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Delete a permission

const deletePermission = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the permission exists
    const permission = await Permission.findByPk(id);

    if (!permission) {
      logger.error(`Deleting Permission: Permission with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Permission not found.',
      });
    }

    // Delete the permission
    await Permission.destroy({ where: { id } });

    return res.status(200).json({
      ok: true,
      message: 'Permission deleted successfully',
    });
  } catch (error) {
    // Log the error using the logger
    logger.error(`Deleting Permission: ${error.message}`);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  addPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
