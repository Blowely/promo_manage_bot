const sequelize = require('./db');
const {DataTypes} = require("sequelize");

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.INTEGER, unique: true},
    //channels: {type: DataTypes.ARRAY({id: DataTypes.INTEGER, name: DataTypes.STRING}), defaultValue: []}
    channels: {type: DataTypes.STRING(10000), defaultValue: ''}
})

module.exports.User = User;