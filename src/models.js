const sequelize = require('./db');
const {DataTypes} = require("sequelize");

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.INTEGER, unique: true},
    channels: {type: DataTypes.STRING(10000), defaultValue: ''},
}, {
    freezeTableName: true,
})

const Channel = sequelize.define('channel', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.UUID},
    //chatId: {type: DataTypes.INTEGER},
    name: {type: DataTypes.STRING, unique: true},
    //channels: {type: DataTypes.ARRAY({id: DataTypes.INTEGER, name: DataTypes.STRING}), defaultValue: []}
    //places: {type: DataTypes.STRING(10000), defaultValue: ''}
},{
    freezeTableName: true,
})

module.exports.User = User;
module.exports.Channel = Channel;