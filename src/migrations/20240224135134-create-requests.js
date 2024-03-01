'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserID: {
        type: Sequelize.INTEGER,
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
      TravelDate: {
        type: Sequelize.DATE,
      },
      SeatsRequired: {
        type: Sequelize.INTEGER,
      },
      Description: {
        type: Sequelize.TEXT,
      },
      Status: {
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
    await queryInterface.dropTable('Requests');
  }
};