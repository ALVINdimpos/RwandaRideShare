'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fname: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      lname: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      phone: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      emailIndex: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      Avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      IsVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      DriverLicense: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isPasswordChanged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      subscriptionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'UserSubscriptions',
          key: 'id',
        },
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
