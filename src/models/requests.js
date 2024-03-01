'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Requests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Requests.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'user',
      });
  
    }
  }
  Requests.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      UserID: {
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
      TravelDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      SeatsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Status: {
        type: DataTypes.ENUM('Pending', 'Matched', 'Unmatched'),
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
      modelName: 'Requests',
    }
  );
  return Requests;
};