'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Permission.belongsToMany(models.Role, {
        through: 'RolePermission',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: 'permissionId',
        timestamps: true,
        as: 'roles',
      });
    }
  }
  Permission.init(
    {
      name: DataTypes.STRING,
      nameIndex: DataTypes.STRING,
      description: DataTypes.STRING,
      display_name: DataTypes.STRING,
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'Permission',
    }
  );
  return Permission;
};
