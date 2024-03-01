'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      DriverID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      Origin: {
        type: Sequelize.STRING,
      },
      Destination: {
        type: Sequelize.STRING,
      },
      DepartureDate: {
        type: Sequelize.DATE,
      },
      DepartureTime: {
        type: Sequelize.TIME,
      },
      AvailableSeats: {
        type: Sequelize.INTEGER,
      },
      PricePerSeat: {
        type: Sequelize.FLOAT,
      },
      CarMake: {
        type: Sequelize.STRING,
      },
      CarModel: {
        type: Sequelize.STRING,
      },
      CarYear: {
        type: Sequelize.INTEGER,
      },
      CarColor: {
        type: Sequelize.STRING,
      },
      LuggageSize: {
        type: Sequelize.STRING,
      },
      TripDescription: {
        type: Sequelize.TEXT,
      },
      Stops: {
        type: Sequelize.TEXT,
        allowNull: true,
        get() {
          return this.getDataValue('Stops')
            ? JSON.parse(this.getDataValue('Stops'))
            : null;
        },
        set(value) {
          this.setDataValue('Stops', value ? JSON.stringify(value) : null);
        },
      },

      TripStatus: {
        type: Sequelize.ENUM('Pending', 'Matched', 'Unmatched'),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Trips');
  }
};