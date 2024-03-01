const { Requests, User, Role, Bookings, Trips } = require('../models');
const { Op } = require('sequelize');
const logger = require('../../loggerConfigs');
const sendEmail = require('../helpers/sendEmail');
const { createNotification } = require('../helpers/notifications');
const { hashData, decryptData } = require('../utils');
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
    const hashRole = hashData('Driver');
    // Filter users with the 'Driver' role
    const drivers = allDrivers.filter(user =>
      user.roles.some(role => role.nameIndex === hashRole)
    );
    
     const notificationMessage = `New ride request from ${user.fname} ${user.lname}:
      - Origin: ${Origin}
      - Destination: ${Destination}
      - Travel Date: ${TravelDate}
      - Seats Required: ${SeatsRequired}
      - Description: ${Description}`;
    // find user

     // Notify only drivers about the new request
     for (const driverToNotify of drivers) {
       await createNotification(
         driverToNotify.id,
         notificationMessage,
         'Request'
       );
       // Send email to the user
       sendEmail('tripRequest', 'RwandaRideShare - New ride request', {
         email: decryptData(driverToNotify.email),
         fname: decryptData(user.fname),
         lname: user.lname,
         origin: Origin,
         destination: Destination,
         travelDate: TravelDate,
         seatsRequired: SeatsRequired,
         description: Description,
       });
     }
    return res.status(201).json({
      ok: true,
      message: 'Request successfully created',
      data: request,
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
// Take and approve a request
const takeAndApproveRequest = async (req, res) => {
  try {
    const { userId } = req;
    const { requestId } = req.params;

    // Check if the request exists
    const request = await Requests.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!request) {
      logger.error(
        `Taking and approving request: Request with ID ${requestId} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Request not found.',
      });
    }

    // Check if the request has already been approved by another driver
    if (request.Status === 'Matched') {
      logger.error(
        'Taking and approving request: Request has already been taken by another driver'
      );
      return res.status(403).json({
        ok: false,
        message: 'Request has already been taken by another driver.',
      });
    }

    // Check if the driver has an available trip that matches the request
    const matchingTrip = await Trips.findOne({
      where: {
        DriverID: userId,
        Origin: request.Origin,
        Destination: request.Destination,
        DepartureDate: request.TravelDate,
        AvailableSeats: {
          [Op.gte]: request.SeatsRequired,
        },
      },
    });

    if (!matchingTrip) {
      logger.error(
        'Taking and approving request: No matching trip found for the driver'
      );
      return res.status(403).json({
        ok: false,
        message: 'No matching trip found for the driver.',
      });
    }

    // Update the booking status as approved
    await Bookings.update(
      { BookingStatus: 'Approved' },
      {
        where: {
          TripID: matchingTrip.id,
          PassengerID: request.UserID,
        },
      }
    );

    // Update the request status as approved
    await Requests.update(
      { Status: 'Matched' },
      {
        where: {
          id: request.id,
        },
      }
    );

    // Decrement the AvailableSeats in the corresponding trip
    const updatedAvailableSeats = matchingTrip.AvailableSeats - request.SeatsRequired;
    await Trips.update(
      { AvailableSeats: updatedAvailableSeats },
      {
        where: {
          id: matchingTrip.id,
        },
      }
    );

    // Send email to the passenger after driver approves the request
    sendEmail('tripApproved', 'RwandaShareRIde - Trip Approved', {
      email: decryptData(request.user.email),
      fname: decryptData(request.user.fname),
      lname: request.user.lname,
      origin: request.Origin,
      destination: request.Destination,
      travelDate: request.TravelDate,
      seatsRequired: request.SeatsRequired,
      description: request.Description,
    });

    // Notify the user that their request is approved
    const notificationMessage = `Your ride request from ${request.user.fname} ${request.user.lname} is approved.`;
    await createNotification(
      request.user.id,
      notificationMessage,
      'Request Approved'
    );

    return res.status(200).json({
      ok: true,
      message: 'Request successfully taken and approved.',
    });
  } catch (error) {
    logger.error(`Taking and approving request: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while taking and approving the request.',
    });
  }
};


module.exports = {
  createRequest,
  getAllRequests,
  getOneRequest,
  takeAndApproveRequest,
};
