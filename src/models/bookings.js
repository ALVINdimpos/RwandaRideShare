'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bookings.belongsTo(models.Trips, {
        foreignKey: 'TripID',
        as: 'trip',
      });
      Bookings.belongsTo(models.User, {
        foreignKey: 'PassengerID',
        targetKey: 'id',
        as: 'passenger',
      });
    }
  }
  Bookings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      TripID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Trips',
          key: 'id',
        },
      },
      PassengerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      BookingStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Declined'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Bookings',
    }
  );
  return Bookings;
};
