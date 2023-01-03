const {Sequelize} = require('sequelize');

module.exports = new Sequelize('moviefokl8', 'moviefokl8', 'Dfkz1947', {host: 'pg2.sweb.ru', port: '5432', dialect: "postgres"})