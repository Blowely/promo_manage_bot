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
    chatId: {type: DataTypes.STRING},
    //chatId: {type: DataTypes.INTEGER},
    name: {type: DataTypes.STRING, unique: true},
    //channels: {type: DataTypes.ARRAY({id: DataTypes.INTEGER, name: DataTypes.STRING}), defaultValue: []}
    today: {type: DataTypes.STRING(10000), defaultValue: ''},
    tomorrow: {type: DataTypes.STRING(10000), defaultValue: ''},
    af_tmrw: {type: DataTypes.STRING(10000), defaultValue: ''},
    spec: {type: DataTypes.STRING(10000), defaultValue: ''}
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING},
    //chatId: {type: DataTypes.INTEGER},
    date: {type: DataTypes.STRING},
    time: {type: DataTypes.STRING},
    getPart: {type: DataTypes.STRING},
    done: {type: DataTypes.BOOLEAN, defaultValue: false}
}, {
    freezeTableName: true
})

module.exports.User = User;
module.exports.Channel = Channel;
module.exports.Order = Order;