var Actor = function(id, name, repo, configs, line, response){
	this.id = id;
	this.name = name;
	this.repo = repo;
	this.configs = configs;
	this.line = line;
	this.response = response;
	
	var express = require('express'),
  		bodyParser = require('body-parser'),
    	methodOverride = require('method-override'),
    	path = require('path');

	var roles = require('./roles');

	try{
		var app = express();

		app.set('views', __dirname.replace('/lib', '/views'));
		app.set('view engine', 'ejs');

		app.use(bodyParser.urlencoded({ extended: false }));
	
		app.use(express.static(path.join(__dirname.replace('lib', ''), 'public')));

		// Routing
		app.use('/', roles);
	
		var actor = require('http').Server(app);
	
	// Catch any unhandled exceptions!!!
	}catch(e){
		console.log(e.message);
		console.log(e.stack);
	}
}

Actor.prototype.getId = function(){ return this.id; }
Actor.prototype.getName = function(){ return this.name; }
Actor.prototype.getRepositoryUrl = function(){ return this.repo; }
Actor.prototype.getConfigurations = function(){ return this.configs; }

Actor.prototype.readLine = function(){ return this.line; }
Actor.prototype.respond = function(){ return this.response; }

module.exports = Actor;