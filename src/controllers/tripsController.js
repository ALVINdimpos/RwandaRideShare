const { Op } = require('sequelize');
const { Trips, User } = require('../models');
const logger = require('../../loggerConfigs');
const {
  validateFields,
} = require('../utils');

// Add trip
const addTrip = async (req, res) => {
    const { userId } = req;
    const DriverID  = userId;
  try {
    // Extract trip details from the request body
    const {
      Origin,
      Destination,
      DepartureDate,
      DepartureTime,
      AvailableSeats,
      PricePerSeat,
      CarMake,
      CarModel,
      CarYear,
      CarColor,
      Stops,
      LuggageSize,
      TripDescription,
    } = req.body;

    // Validate if required fields are present
    const requiredFields = [
      'Origin',
      'Destination',
      'DepartureDate',
      'DepartureTime',
      'AvailableSeats',
      'PricePerSeat',
      'CarMake',
      'CarModel',
      'CarYear',
      'CarColor',
      'LuggageSize',
      'TripDescription',
    ];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      logger.error(
        `Adding Trip: Required fields are missing: ${missingFields.join(', ')}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
    }

    // Check if the driver (User) exists
    const driver = await User.findByPk(DriverID);
    if (!driver) {
      logger.error(`Adding Trip: Driver with ID ${DriverID} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Driver not found',
      });
    }

    // Create a new trip
    const trip = await Trips.create({
      DriverID,
      Origin,
      Destination,
      DepartureDate,
      DepartureTime,
      AvailableSeats,
      PricePerSeat,
      CarMake,
      CarModel,
      CarYear,
      CarColor,
      Stops,
      LuggageSize,
      TripDescription,
    });

    return res.status(201).json({
      ok: true,
      message: 'Trip successfully added',
      data: trip,
    });
  } catch (error) {
    logger.error(`Adding a trip: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while adding the trip.',
    });
  }
};

// Retrieve trips
const getTrips = async (req, res) => {
  try {
    // Fetch all trips
    const trips = await Trips.findAll({
      include: [
        {
          model: User,
          as: 'driver',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      data: trips,
    });
  } catch (error) {
    logger.error(`Retrieving trips: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
const getTripsByDriver = async (req, res) => {
  const {userId} = req;
  try {
    // Fetch all trips
    const trips = await Trips.findAll({
      include: [
        {
          model: User,
          as: 'driver',
        },
      ],
      where: {
        DriverID: userId,
      },
      order: [['createdAt', 'DESC']],
    });
   logger.info('Trips retrieved successfully');
    return res.status(200).json({
      ok: true,
      data: trips,
    });
  } catch (error) {
    logger.error(`Retrieving trips: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
// Get one trip
const getOneTrip = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch a single trip by ID
    const trip = await Trips.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
        },
      ],
    });

    if (!trip) {
      logger.error(`Fetching a trip: Trip with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Trip not found.',
      });
    } else {
      return res.status(200).json({
        ok: true,
        data: trip,
      });
    }
  } catch (error) {
    logger.error(`Fetching a trip: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the trip.',
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract fields to update from the request body
    const {
      Origin,
      Destination,
      DepartureDate,
      DepartureTime,
      AvailableSeats,
      PricePerSeat,
      CarMake,
      CarModel,
      CarYear,
      CarColor,
      Stops,
      LuggageSize,
      TripDescription,
      TripStatus,
    } = req.body;

    // Find the trip by ID
    const trip = await Trips.findByPk(id);
    if (!trip) {
      logger.error(`Updating a trip: Trip with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }

    // Update fields if provided
    if (Origin) trip.Origin = Origin;
    if (Destination) trip.Destination = Destination;
    if (DepartureDate) trip.DepartureDate = DepartureDate;
    if (DepartureTime) trip.DepartureTime = DepartureTime;
    if (AvailableSeats) trip.AvailableSeats = AvailableSeats;
    if (PricePerSeat) trip.PricePerSeat = PricePerSeat;
    if (CarMake) trip.CarMake = CarMake;
    if (CarModel) trip.CarModel = CarModel;
    if (CarYear) trip.CarYear = CarYear;
    if (CarColor) trip.CarColor = CarColor;
    if (Stops) trip.Stops = Stops;
    if (LuggageSize) trip.LuggageSize = LuggageSize;
    if (TripDescription) trip.TripDescription = TripDescription;
    if (TripStatus) trip.TripStatus = TripStatus;

    // Save changes to the trip
    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip successfully updated',
      data: trip,
    });
  } catch (error) {
    logger.error(`Updating trip: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the trip.',
    });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the trip by ID
    const trip = await Trips.findByPk(id);
    if (!trip) {
      logger.error(`Deleting a trip: Trip with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Trip not found',
      });
    }

    // Delete the trip
    await trip.destroy();
    return res.status(200).json({
      ok: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a trip: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};
// Retrieve trips with search
const searchTrips = async (req, res) => {
  try {
    // Extract search parameters from query
    const { from, to, leaving } = req.query;

    // Build the search conditions based on provided parameters
    const searchConditions = {};
    if (from) {
      searchConditions.Origin = from;
    }
    if (to) {
      searchConditions.Destination = to;
    }
    if (leaving) {
      searchConditions.DepartureDate = leaving;
    }

    // Fetch trips with search conditions
    const trips = await Trips.findAll({
      include: [
        {
          model: User,
          as: 'driver',
        },
      ],
      where: searchConditions, 
      order: [['createdAt', 'DESC']],
    });

    if (trips.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'No trips found with the provided search criteria.',
      });
    }

    return res.status(200).json({
      ok: true,
      data: trips,
    });
  } catch (error) {
    logger.error(`Retrieving trips: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};



module.exports = {
  addTrip,
  getTrips,
  getOneTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  getTripsByDriver,
};
