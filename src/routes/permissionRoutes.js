const express = require('express');
const {
  addPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
} = require('../controllers/permissionController');

const router = express.Router();

// Permission routes

// Add a permission
router.post('/', addPermission);

// Get all permissions
router.get('/', getPermissions);

// Get a single permission
router.get('/:id', getPermission);

// Update a permission
router.put('/:id', updatePermission);

// Delete a permission
router.delete('/:id', deletePermission);

module.exports = router;
