module.exports = _ = require('underscore');
module.exports = nock = require('nock');

module.exports = Sequelize = require('sequelize');
module.exports = sequelize = new Sequelize('rehearsal', 'root', '', {host: 'localhost', 
															 																			 port: 3306, 
															 																			 dialect: 'mysql',
															 																			 logging: false});
