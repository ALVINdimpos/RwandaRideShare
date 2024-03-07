const { Bookings, Trips, User } = require('../models');
const { createNotification } = require('../helpers/notifications');
const logger = require('../../loggerConfigs');
const sendEmail = require('../helpers/sendEmail');
const { decryptData } = require('../utils');
// Create booking
const createBooking = async (req, res) => {
  try {
    // Extract booking details from the request body
    const { TripID } = req.query;
    const { userId } = req;
    const PassengerID = userId;

    // check if PassengerID provided
    if (!PassengerID) {
      logger.error(
        `Creating Booking: Required fields are missing: ${PassengerID.join(
          ', '
        )}`
      );
      return res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${PassengerID.join(', ')}`,
      });
    }

    // Check if the trip exists
    const trip = await Trips.findByPk(TripID);
    if (!trip) {
      logger.error(`Creating Booking: Trip with ID ${TripID} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Trip not found',
      });
    }

    // Check if the passenger (User) exists
    const passenger = await User.findByPk(PassengerID);
    if (!passenger) {
      logger.error(
        `Creating Booking: Passenger with ID ${PassengerID} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Passenger not found',
      });
    }

    // Create a new booking
    const booking = await Bookings.create({
      TripID,
      PassengerID,
    });

    // Retrieve the owner (Driver) of the trip
    const driverId = trip.DriverID;

    // send email to the driver
    const driver = await User.findByPk(driverId);
    sendEmail('tripBooked', 'RwandaShareRIde - Trip Booked', {
      email: decryptData(driver.email),
      driver: `${decryptData(driver.fname)}`,
      passenger: `${decryptData(passenger.fname)} ${decryptData(
        passenger.lname
      )}`,
      origin: trip.Origin,
      destination: trip.Destination,
      travelDate: trip.DepartureDate,
    });

    // Create a notification for the trip owner
    await createNotification(
      driverId,
      `You have a new booking from ${passenger.fname} ${passenger.lname}`,
      'Booking'
    );
    logger.info('Booking successfully created');
    return res.status(201).json({
      ok: true,
      message: 'Booking successfully created',
      data: booking,
    });
  } catch (error) {
    logger.error(`Creating booking: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while creating the booking.',
    });
  }
};

// Retrieve all bookings for a trip
const getAllBookingsForTrip = async (req, res) => {
  try {
    const { tripId } = req.query;
    // check if tripId provided
    if (!tripId) {
      logger.error(`Retrieving bookings for a trip: tripId missing: tripId`);
      return res.status(400).json({
        ok: false,
        message: `tripId missing`,
      });
    }
    // Check if the trip exists
    const trip = await Trips.findByPk(tripId);
    if (!trip) {
      logger.error(
        `Retrieving bookings for a trip: Trip with ID ${tripId} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Trip not found',
      });
    }
    // Check if the trip has bookings
    const tripBookings = await Bookings.findAll({
      where: {
        TripID: tripId,
      },
      include: [
        {
          model: User,
          as: 'passenger',
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      data: tripBookings,
    });
  } catch (error) {
    logger.error(`Retrieving bookings for a trip: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

// Retrieve one booking
const getOneBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch a single booking by ID
    const booking = await Bookings.findByPk(id, {
      include: [
        {
          model: User,
          as: 'passenger',
        },
      ],
    });

    if (!booking) {
      logger.error(`Fetching a booking: Booking with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Booking not found.',
      });
    } else {
      return res.status(200).json({
        ok: true,
        data: booking,
      });
    }
  } catch (error) {
    logger.error(`Fetching a booking: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the booking.',
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract fields to update from the request body
    const { BookingStatus } = req.body;

    // Find the booking by ID
    const booking = await Bookings.findByPk(id);
    if (!booking) {
      logger.error(`Updating a booking: Booking with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Update fields if provided
    if (BookingStatus) booking.BookingStatus = BookingStatus;

    // Save changes to the booking
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking status successfully updated',
      data: booking,
    });
  } catch (error) {
    logger.error(`Updating booking status: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the booking status.',
    });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the booking by ID
    const booking = await Bookings.findByPk(id);
    if (!booking) {
      logger.error(`Deleting a booking: Booking with ID ${id} not found`);
      return res.status(404).json({
        ok: false,
        message: 'Booking not found',
      });
    }

    // Delete the booking
    await booking.destroy();
    return res.status(200).json({
      ok: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    logger.error(`Deleting a booking: ${error.message}`);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};
// Get all driver bookings
const getDriverBookings = async (req, res) => {
  try {
    const { userId } = req; // Assuming userId is the DriverID

    // Fetch all bookings for the driver including associated trips and passengers
    const bookings = await Bookings.findAll({
      where: {
        '$trip.DriverID$': userId,
        'BookingStatus': 'Pending',
      },
      include: [
        {
          model: Trips,
          as: 'trip',
        },
        {
          model: User,
          as: 'passenger',
        },
      ],
    });
    logger.info('Driver bookings retrieved successfully');
    return res.status(200).json({
      ok: true,
      data: bookings,
    });
  } catch (error) {
    logger.error(`Getting driver bookings: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while getting driver bookings.',
    });
  }
};
// Accept or decline a booking request
const processBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const { action } = req.body;

    // Find the booking by ID
    const booking = await Bookings.findByPk(bookingId, {
      include: [
        {
          model: Trips,
          include: [
            {
              model: User,
              as: 'driver',
            },
          ],
          as: 'trip',
        },
        {
          model: User,
          as: 'passenger',
        },
      ],
    });

    if (!booking) {
      logger.error(
        `Processing booking request: Booking with ID ${bookingId} not found`
      );
      return res.status(404).json({
        ok: false,
        message: 'Booking not found.',
      });
    }

    // Perform the requested action (approve or decline)
    if (action === 'approve') {
      // Update booking status to 'Approved'
      await booking.update({ BookingStatus: 'Approved' });

      // Update available seats in the trip
      const updatedAvailableSeats = booking.trip.AvailableSeats - 1;
      await booking.trip.update({ AvailableSeats: updatedAvailableSeats });
      // send email to the passenger
      sendEmail('approveBooking', 'RwandaShareRIde - Trip Approved', {
        email: decryptData(booking.passenger.email),
        driver: `${decryptData(booking.trip.driver.fname)} ${decryptData(
          booking.trip.driver.lname
        )}`,
        passenger: `${decryptData(booking.passenger.fname)} ${decryptData(
          booking.passenger.lname
        )}`,
        origin: booking.trip.Origin,
        destination: booking.trip.Destination,
        travelDate: booking.trip.DepartureDate,
      });
      // Notify passenger about the approval
      const notificationMessage = `Great news! Your booking request for the trip with ${booking.trip.driver.fname} ${booking.trip.driver.lname} has been approved. Your driver will pick you up at ${booking.trip.DepartureDate}. Please be ready for a smooth journey. Safe travels!`;

      await createNotification(
        booking.PassengerID,
        notificationMessage,
        'Booking'
      );
    } else if (action === 'decline') {
      // Update booking status to 'Declined'
      await booking.update({ BookingStatus: 'Declined' });

      // Notify passenger about the decline
      await createNotification(
        booking.PassengerID,
        `Your booking request for trip with ${booking.trip.driver.fname} ${booking.trip.driver.lname} has been declined.`,
        'Booking'
      );
    } else {
      logger.error(`Processing booking request: Invalid action: ${action}`);
      return res.status(400).json({
        ok: false,
        message: 'Invalid action. Use "approve" or "decline".',
      });
    }

    logger.info(
      `Booking ${action === 'approve' ? 'approved' : 'declined'} successfully`
    );
    return res.status(200).json({
      ok: true,
      message: `Booking ${
        action === 'approve' ? 'approved' : 'declined'
      } successfully.`,
      data: booking,
    });
  } catch (error) {
    logger.error(`Processing booking request: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while processing the booking request.',
    });
  }
};

module.exports = {
  createBooking,
  getAllBookingsForTrip,
  getOneBooking,
  updateBookingStatus,
  deleteBooking,
  getDriverBookings,
  processBookingRequest,
};
