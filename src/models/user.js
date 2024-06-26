'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, {
        through: 'UserRole',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        timestamps: false,
        as: 'roles',
      });
      User.hasMany(models.Trips, {
        foreignKey: 'DriverID',
        as: 'trips',
      });
      User.hasMany(models.Bookings, {
        foreignKey: 'PassengerID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.Requests, {
        foreignKey: 'UserID',
        as: 'requests',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      User.hasOne(models.ResetPasswordToken, {
        foreignKey: 'UserId',
        as: 'resetPasswordToken',
      });
      User.hasOne(models.Subscription, {
        foreignKey: 'userId',
        as: 'subscription',
      });
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages',
      });
      User.hasMany(models.Message, {
        foreignKey: 'receiverId',
        as: 'receivedMessages',
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      fname: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      lname: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      emailIndex: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      IsVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      DriverLicense: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPasswordChanged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
      modelName: 'User',
      paranoid: true,
    }
  );
  return User;
};
