"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query("SELECT id from Users;")
      .then((users) => {
        const userRows = users[0];
        console.log(users);
        return queryInterface.bulkInsert(
          "Posts",
          [
            {
              text: "Lorem ipsum 1",
              userId: userRows[0].id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              text: "Lorem ipsum 2",
              userId: userRows[1].id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          {}
        );
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Posts", null, {});
  },
};
