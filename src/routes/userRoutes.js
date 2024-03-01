const express = require('express');
const {
  addUser,
  getUsers,
  getOneUser,
  deleteUser,
  updateUser,
  approveUserIfIsDriver,
} = require('../controllers/usersController');
const { isAdmin } = require('../middleware');
const { isValidUpload } = require('../middleware');

const router = express.Router();

const fields = [
  { name: 'Avatar', maxCount: 1 },
  { name: 'DriverLicense', maxCount: 1 },
];

// Users routes
router.post('/', isValidUpload(fields), addUser);
router.get('/',  getUsers);
router.get('/:id', isAdmin, getOneUser);
router.patch('/:id', isValidUpload(fields), updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.put('/approve/:id', isAdmin, approveUserIfIsDriver);



module.exports = router;
