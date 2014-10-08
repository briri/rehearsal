require('./init');

var util = require('util'),
		events = require('events'),
		express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
		path = require('path');

var Actor = require('./model/actor'),
		Play = require('./model/play');

var Writer = function(){
	this.registeredLines = {};
	
	var app = express();
	
	app.set('views', __dirname.replace('/lib', '/views'));
	app.set('view engine', 'ejs');

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname.replace('lib', ''), 'public')));

	app.use(function(request, response){
		var out = this.registeredLines[request.path],
				accept = (request.accepts('json') ? 'application/json' : (request.accepts('xml') ? 'application/xml' : 'text/html')),
				body = (request.accepts('json') ? JSON.stringify({}) : ''),
				status = 404;
		
		if(out == undefined){
			this.registeredLines[request.path]; 
			
			this.emit('undefined', request.path);
			
		}else{
			status = 200;
			body = out.toString();	
		}
		
		response.setHeader('Content-Type', accept);
    response.writeHead(status);
    response.end(body);
		
	});
	
	this.server = require('http').Server(app).listen(9099, function(){
		console.log('Proxy server started.');
		
	});
	
  // Terminate the default service
  this.server.on('close', function(){
    console.log('Shutting down proxy server.');
  });
  
  // Capture any server errors and log it. Shut down the default service if its running
  this.server.on('error', function(err){
    console.log('Proxy Server Error: ' + err);
  });
};

util.inherits(Writer, events.EventEmitter);

// ----------------------------------------------------------------------------------------------
Writer.prototype.findAllActors = function(callback){
	var actors = [];
	
	database.query('SELECT id FROM actors WHERE active = 1 ORDER BY level, name', function(err, rows){
		if(err) console.log('Unable to load actors: ' + err);
		
		var count = 0;
		_.forEach(rows, function(row){
			new Actor().load(row.id, function(ret){
				actors.push(ret);
				count++;
			});
		});
		
		var waitForLoad = setInterval(function(){
			if(count >= _.size(rows)){
				callback(actors);
				clearInterval(waitForLoad);
			}
		}, 10);
	});
};

// ----------------------------------------------------------------------------------------------
Writer.prototype.findAllPlays = function(callback){
	var plays = [];
	
	database.query('SELECT id FROM plays WHERE active = 1 ORDER BY title', function(err, rows){
		if(err) console.log('Unable to load plays: ' + err);
		
		var count = 0;
		_.forEach(rows, function(row){
			new Play().load(row.id, function(ret){
				plays.push(ret);
				count++;
			});
		});
		
		var waitForLoad = setInterval(function(){
			if(count >= _.size(rows)){
				callback(plays);
				clearInterval(waitForLoad);
			}
		}, 10);
	});
};


// ----------------------------------------------------------------------------------------------
Writer.prototype.registerLine = function(lineIn, lineOut){	
	this.registeredLines[lineIn] = lineOut;
	
	if(method.toLowerCase() == 'get'){
		router.get(line, function(request, response, next){
			var resp = this.registeredLines[id];
			
			_.forEach()
	    response.setHeader('Content-Type', 'application/json');
	    response.writeHead(404);
	    response.end(JSON.stringify(this.registeredLines[id['body']]));
		});
	
	}else if(method.toLowerCase() == 'post'){
		
		
	}else{
		
	}
	
	return id;
};

// ----------------------------------------------------------------------------------------------
Writer.prototype.setResponse = function(path, response){ this.registeredLines[id] = response; }
Writer.prototype.close = function(){ this.server.close(); }

module.exports = Writer;