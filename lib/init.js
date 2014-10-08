var mysql = require('mysql');

module.exports = _ = require('underscore');
module.exports = yaml = require('js-yaml');

var conn = mysql.createConnection({
	host: 'localhost', 
	port: 3306,
	user: 'root',
	password: '',
	database: 'rehearsal',
	debug: ['ComQueryPacket']
});

conn.connect(function(err){
	if(err) console.log('Unable to establish a connection to the database!');

	console.log('Successfully connected to the database.');
});

module.exports = database = conn;

