var mysql = require('mysql');

module.exports = util = require('util');
module.exports = fs = require('fs');
module.exports = yaml = require('js-yaml');
module.exports = uuid = require('node-uuid');

module.exports = http = require('http');
module.exports = url = require('url');

module.exports = _ = require('underscore');

var config = yaml.load(fs.readFileSync(process.cwd() + '/config/app.yml', 'utf8'));

var conn = mysql.createConnection({
  host: config['db_host'], 
  port: config['db_port'],
  user: config['db_user'],
  password: config['db_pwd'],
  database: config['db_name']
  //, debug: ['ComQueryPacket']
});

conn.connect(function(err){
  if(err) console.log('Unable to establish a connection to the database!');

  console.log('Successfully connected to the database.');
});

module.exports = database = conn;

