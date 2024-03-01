'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ResetPasswordToken extends Model {
    static associate(models) {
      // Add this association
      ResetPasswordToken.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
    }
  }
  ResetPasswordToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
    },
    {
      sequelize,
      modelName: 'ResetPasswordToken',
    }
  );
  return ResetPasswordToken;
};
