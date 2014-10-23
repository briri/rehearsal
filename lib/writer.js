require('./init');

var util = require('util'),
		events = require('events'),
		express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
		path = require('path');

var Actor = require('./model/actor'),
		Play = require('./model/play');

/*
-----------------------------------------------------------------------------------
This web server is currently having problems receiving calls from isolated instances of 
actors. The cedilla aggregator for example records a timeout when trying to contact 
this web server via an http post.
		
This server code may make more sense in a separate file called Understudy!
-----------------------------------------------------------------------------------
*/
		
var Writer = function(callback){
  // Call the constructor for EventEmitter
  events.EventEmitter.call(this);
	
	this.registeredLines = {};
	this.stagehand = undefined;
	
	var app = express();
	
	app.set('views', __dirname.replace('/lib', '/views'));
	app.set('view engine', 'ejs');

//	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname.replace('lib', ''), 'public')));

	var _self = this;

//	app.get('/ping', function(request, response){ response.writeHead(200); response.end('pong'); })

//	app.post('/sfx', function(req, resp){ console.log('Got a POST to /sfx!'); resp.end('Thanks POST!'); });
//	app.get('/sfx', function(req, resp){ console.log('Got a GET to /sfx!'); resp.end('Thanks GET!'); });

	app.use(function(request, response){
		
		console.log('Received a call from to ' + request.path);
		//console.log(request);

		var out = 'Hello World!',
				query = '';
				
/*		_.forEach(request.query, function(val, key){
			query += (query.length > 0 ? '&' : '') + key + '=' + val;
		});*/

console.log(request.query);
console.log(request.body);

/*		_self.retrieveResponse(request.path, query, function(response){
			
			if(response != undefined){
	console.log(response);
			
				this.emit('request', response);
*/			
				response.setHeader('Content-Type', '*/*');

		    response.writeHead(200);
		    response.end(out);
				
/*			}else{
				console.log('The actor does not exist for: ' + query);
			}
		});
*/		
	});
	
	this.server = require('http').Server(app).listen(9099, function(){
		console.log('Understudy server started and listening on 9099.');
		callback();
	});
	
  // Terminate the default service
  this.server.on('close', function(){
    console.log('Shutting down Understudy server.');
  });
  
  // Capture any server errors and log it. Shut down the default service if its running
  this.server.on('error', function(err){
    console.log('Understudy Server Error: ' + err);
  });
	
	// Establish a Socket.IO listener
//  var io = require('socket.io')(this.server);

  // ----------------------------------------------------------------------------------------------
/*  io.on('connection', function (socket) {

    socket.on('openurl', function (data) {
			
console.log('Proxy got a call on Socket IO!');
console.log(data);

		});
		
  });*/
	
};

util.inherits(Writer, events.EventEmitter);

// ----------------------------------------------------------------------------------------------
/*Writer.prototype.retrieveResponse = function(path, query, callback){
	database.query('SELECT id FROM actors WHERE role = ?', [path], function(err, actors){
		if(err){
			console.log(err);
			console.log(stack)
	
			callback({'error': err.toString()});
			
		}else{
			if(_.size(actors) > 0){
				database.query('SELECT id, sceneId, lineOut FROM script WHERE actorId = ? AND lineIn = ?', [actors[0].id, query], function(err, rows){
					if(err){
						console.log(err);
						console.log(stack)
						callback({'error': err.toString()});
						
					}else{
						if(_.size(rows) > 0){
							var line = new Line({}).load(rows[0].id);
							line.lineOut
							
							callback({'scene': rows[0].sceneId, 'actor': actors[0].id, 'lineIn': query, 'lineOut': rows[0].lineOut});
							
						}else{
							callback(undefined);
						}
					}
				});
			}else{
				// No actor exists for that path
				callback(undefined);
			}
		}
	});
};*/

Writer.prototype.setStagehand = function(stagehand){ this.stagehand = stagehand; };

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