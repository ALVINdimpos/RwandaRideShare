// controllers/contactUsController.js
const { validateFields } = require('../utils');
const logger = require('../../loggerConfigs');
const { ContactUs } = require('../models');

const createContactUsEntry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input data
    const requiredFields = ['name', 'email', 'message'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    // Create a new ContactUs entry in the database
    const contactUsEntry = await ContactUs.create({
      name,
      email,
      message,
    });
    logger.info('ContactUs entry created successfully');
    return res.status(201).json({
      success: true,
      message: 'ContactUs entry created successfully',
      data: contactUsEntry,
    });
  } catch (error) {
    logger.error(`Creating ContactUs entry: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
// get all contactUs entries
const getAllContactUsEntries = async (req, res) => {
  try {
    const contactUsEntries = await ContactUs.findAll();
    return res.status(200).json({
      ok: true,
      data: contactUsEntries,
    });
  } catch (error) {
    logger.error(`Fetching all ContactUs entries: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while fetching all ContactUs entries.',
    });
  }
};
// get one contactUs entry
const getOneContactUsEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const contactUsEntry = await ContactUs.findByPk(id);
    return res.status(200).json({
      ok: true,
      data: contactUsEntry,
    });
  } catch (error) {
    logger.error(`Fetching one ContactUs entry: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while fetching one ContactUs entry.',
    });
  }
};
// delete one contactUs entry
const deleteOneContactUsEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await ContactUs.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({
      ok: true,
      message: 'ContactUs entry deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting one ContactUs entry: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while deleting one ContactUs entry.',
    });
  }
};
module.exports = {
  createContactUsEntry,
  getAllContactUsEntries,
  getOneContactUsEntry,
  deleteOneContactUsEntry,
};
