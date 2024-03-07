// routes.js

const express = require('express');
const router = express.Router();
const {
     createContactUsEntry,
    getAllContactUsEntries,
    getOneContactUsEntry,
    deleteOneContactUsEntry,
} = require('../controllers/contactUsController');

// Route to handle contact us form submission
router.post('/', createContactUsEntry);
router.get('/', getAllContactUsEntries);
router.get('/:id', getOneContactUsEntry);
router.delete('/:id', deleteOneContactUsEntry);

module.exports = router;
