"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsToMany(models.User, { through: "users_chats" });
      Chat.hasMany(models.Message);
    }
  }
  Chat.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Chat",
    }
  );
  return Chat;
};
