/** @type {import('sequelize-cli').Seed} */

const { User, Role } = require('../models');
const { encryptData, hashPassword, hashData } = require('../utils');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find existing roles
    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    const driverRole = await Role.findOne({ where: { name: 'Driver' } });
    const passengerRole = await Role.findOne({ where: { name: 'Passenger' } });

    // Seed Admin user
    const adminUser = {
      fname: encryptData('Admin'),
      lname: encryptData('Admin'),
      email: encryptData('admin@example.com'),
      emailIndex: hashData('admin@example.com'),
      password: hashPassword('AdminPass123'),
      IsDriver: false,
      IsVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed Driver user
    const driverUser = {
      fname: encryptData('Driver'),
      lname: encryptData('Driver'),
      email: encryptData('driver@example.com'),
      emailIndex: hashData('driver@example.com'),
      password: hashPassword('DriverPass123'),
      IsDriver: true,
      IsVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed Passenger user
    const passengerUser = {
      fname: encryptData('Passenger'),
      lname: encryptData('Passenger'),
      email: encryptData('passenger@example.com'),
      emailIndex: hashData('passenger@example.com'),
      password: hashPassword('PassengerPass123'),
      IsDriver: false,
      IsVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create users
    const admin = await User.create(adminUser);
    const driver = await User.create(driverUser);
    const passenger = await User.create(passengerUser);

    // Associate roles with the users
    await admin.addRole(adminRole);
    await driver.addRole(driverRole);
    await passenger.addRole(passengerRole);
  },

  async down(queryInterface, Sequelize) {
    // Remove seeded data if needed
    await User.destroy({
      where: {
        email: [
          'admin@example.com',
          'driver@example.com',
          'passenger@example.com',
        ],
      },
    });
  },
};
