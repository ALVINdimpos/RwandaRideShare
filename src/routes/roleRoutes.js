const express = require('express');
const {
  addRole,
  getRoles,
  getArchivedRoles,
  getOneRole,
  updateRole,
  deleteRole,
} = require('../controllers/rolesController');
const { isAdmin } = require('../middleware');

const router = express.Router();

// Roles routes
router.post('/',isAdmin, addRole);
router.get('/',  getRoles);
router.get('/archived', isAdmin, getArchivedRoles);
router.get('/:id', isAdmin, getOneRole);
router.put('/:id', isAdmin, updateRole);
router.delete('/:id', isAdmin, deleteRole);

module.exports = router;
