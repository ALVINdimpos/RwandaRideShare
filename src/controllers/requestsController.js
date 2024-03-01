const { Requests, User, Role } = require('../models');
const logger = require('../../loggerConfigs');
const { createNotification } = require('../helpers/notifications');
// Create request
const createRequest = async (req, res) => {
  try {
    const { userId } = req;
    const { Origin, Destination, TravelDate, SeatsRequired, Description } =
      req.body;

    // Validate if required fields are present
    const requiredFields = [
      'Origin',
      'Destination',
      'TravelDate',
      'SeatsRequired',
      'Description',
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      logger.error(
        `Creating Request: Required fields are missing: ${missingFields.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // Check if the user (requester) exists
    const user = await User.findByPk(userId);
    if (!user) {
      logger.error(`Creating Request: User with ID ${userId} not found`);
      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }

    // Create a new request
    const request = await Requests.create({
      UserID: userId,
      Origin,
      Destination,
      TravelDate,
      SeatsRequired,
      Description,
    });

    // Notify only drivers about the new request
    const allDrivers = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
        },
      ],
      order: [['createdAt', 'DESC']],
    });


    const notificationMessage = `New ride request from ${user.fname} ${user.lname}.`;

    for (const driverToNotify of allDrivers) {
      await createNotification(
        driverToNotify.id,
        notificationMessage,
        'Request'
      );
    }

    return res.status(201).json({
      ok: true,
      message: 'Request successfully created',
      data: allDrivers,
    });
  } catch (error) {
    logger.error(`Creating request: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while creating the request.',
    });
  }
};

// Retrieve all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Requests.findAll({
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      data: requests,
    });
  } catch (error) {
    logger.error(`Retrieving all requests: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Retrieve one request
const getOneRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Requests.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!request) {
      logger.error(`Fetching a request: Request with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Request not found.',
      });
    } else {
      return res.status(200).json({
        ok: true,
        data: request,
      });
    }
  } catch (error) {
    logger.error(`Fetching a request: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the request.',
    });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    const request = await Requests.findByPk(id);
    if (!request) {
      logger.error(`Updating a request: Request with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
      });
    }

    if (Status) request.Status = Status;

    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Request status successfully updated',
      data: request,
    });
  } catch (error) {
    logger.error(`Updating request status: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the request status.',
    });
  }
};

// Delete request
const deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Requests.findByPk(id);
    if (!request) {
      logger.error(`Deleting a request: Request with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Request not found',
      });
    }

    await request.destroy();
    return res.status(200).json({
      ok: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a request: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getOneRequest,
  updateRequestStatus,
  deleteRequest,
};
