const express = require('express');
const {
  addUser,
  getUsers,
  getArchivedUsers,
  getOneUser,
  deleteUser,
  updateUser,
} = require('../controllers/usersController');
const { isAdmin } = require('../middleware');

const router = express.Router();

// Users routes
router.post('/', addUser);
router.get('/',  getUsers);
router.get('/archived', isAdmin, getArchivedUsers);
router.get('/:id', isAdmin, getOneUser);
router.put('/:id', isAdmin, updateUser);
router.delete('/:id', isAdmin, deleteUser);

module.exports = router;
