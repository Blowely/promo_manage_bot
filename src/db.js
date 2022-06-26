const {Sequelize} = require('sequelize');

module.exports = new Sequelize('tgBotDB', 'root', 'root', {host: '81.163.24.30', port: '6432', dialect: "postgres"})