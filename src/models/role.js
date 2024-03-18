// models/role.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: 'UserRole',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        timestamps: true,
        as: 'users',
      });
      Role.belongsToMany(models.Permission, {
        through: 'RolePermission',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: 'roleId',
        timestamps: true,
        as: 'permissions',
      });
    }
  }
  
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      nameIndex: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      display_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: 'Role',
      paranoid: true,
    }
  );

  return Role;
};
