/** @type {import('sequelize').Seeder} */

const { encryptData, hashData } = require('../utils');

module.exports = {
  async up(queryInterface, Sequelize) {
    const {
      SEED_ROLE_NAME_1,
      SEED_ROLE_INDEX_NAME_1,
      SEED_ROLE_DISPLAY_NAME_1,
      SEED_ROLE_DESCRIPTION_1,
      SEED_ROLE_NAME_2,
      SEED_ROLE_INDEX_NAME_2,
      SEED_ROLE_DISPLAY_NAME_2,
      SEED_ROLE_DESCRIPTION_2,
      SEED_ROLE_NAME_3,
      SEED_ROLE_INDEX_NAME_3,
      SEED_ROLE_DISPLAY_NAME_3,
      SEED_ROLE_DESCRIPTION_3,
    } = process.env;
    const roles = [
      {
        name: encryptData(SEED_ROLE_NAME_1),
        nameIndex: hashData(SEED_ROLE_INDEX_NAME_1),
        display_name: encryptData(SEED_ROLE_DISPLAY_NAME_1),
        description: encryptData(SEED_ROLE_DESCRIPTION_1),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: encryptData(SEED_ROLE_NAME_2),
        nameIndex: hashData(SEED_ROLE_INDEX_NAME_2),
        display_name: encryptData(SEED_ROLE_DISPLAY_NAME_2),
        description: encryptData(SEED_ROLE_DESCRIPTION_2),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: encryptData(SEED_ROLE_NAME_3),
        nameIndex: hashData(SEED_ROLE_INDEX_NAME_3),
        display_name: encryptData(SEED_ROLE_DISPLAY_NAME_3),
        description: encryptData(SEED_ROLE_DESCRIPTION_3),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return await queryInterface.bulkInsert('Roles', roles);
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('Roles', null, {});
  },
};
