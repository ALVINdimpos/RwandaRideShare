'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trips extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Trips.belongsTo(models.User, {
        foreignKey: 'DriverID',
        as: 'driver',
      });
    }
  }
  Trips.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      DriverID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      Origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Destination: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      DepartureDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      DepartureTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      AvailableSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PricePerSeat: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Car: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      CarMake: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      CarModel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      CarYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CarColor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Stops: {
        type: DataTypes.TEXT,
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

      LuggageSize: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TripDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      TripStatus: {
        type: DataTypes.STRING,
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
      modelName: 'Trips',
    }
  );
  return Trips;
};