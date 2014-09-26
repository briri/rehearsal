module.exports = _ = require('underscore');
module.exports = yaml = require('js-yaml');

module.exports = Sequelize = require('sequelize');
module.exports = sequelize = new Sequelize('rehearsal', 'root', '', {host: 'localhost', 
															 																			 port: 3306, 
															 																			 dialect: 'mysql',
															 																			 logging: false});
