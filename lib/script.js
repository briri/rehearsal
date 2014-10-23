var events = require('events'),
		util = require('util'),
		http = require('http'),
		vm = require('vm'),
		url = require('url'),
		uuid = require('node-uuid'),
		Line = require('./model/line'),
		Actor = require('./model/actor'),
		Play = require('./model/play');

var Script = function(writer, stagehand, play){
  // Call the constructor for EventEmitter
  events.EventEmitter.call(this);
	
	this.writer = writer;
	this.stagehand = stagehand;
	this.play = play;
}

// -----------------------------------------------------------------------------------------------
util.inherits(Script, events.EventEmitter);

// -----------------------------------------------------------------------------------------------
Script.prototype.audition = function(critic, actors, callback){
	// This is the currently functioning test script. It simply calls the LIVE system farm and records the results 
	// retrieved from the components in the DB. If results already exist in the DB it checks them against what was
	// currently returned.
	
	var count =0,
			tiers = {};
			
	// group the actors into their respective tiers
	_.forEach(actors, function(actor){
		if(!tiers[actor.getLevel()]) tiers[actor.getLevel()] = [];

		tiers[actor.getLevel()].push(actor);
		count++;
	});

	var _self = this;
	
	var waitForTiers = setInterval(function(){
		if(count >= _.size(actors)){
			clearInterval(waitForTiers);
	
			// determine which tier is the top level
			var firstTier = _.first( _.sortBy( _.keys(tiers), function(tier){ return tier; } ) );
		
			// Run through each act act and its scenes
			_self.play.getActs(function(acts){
				var actsCompleted = 0;

				console.log('PLAY: ' + _self.play.getTitle());

				_.forEach(acts, function(act){
					console.log('.. ACT: ' + act.getTitle());

					act.getScenes(function(scenes){
						var scenesCompleted = 0;
			
						_.forEach(scenes, function(scene){
							var linesRead = 0;
				
							console.log('.... SCENE: ' + scene.getOpeningLine());

							_.forEach(tiers[firstTier], function(actor){
								
								_self._rehearse(scene.getOpeningLine(), actor, _self.stagehand.getLiveUrl(actor.getSetName()), function(response){
									// Replace any time stamps as they will never match in future runs!
									var newLine = new Line({'sceneId': scene.getId(),
																					'actorId': actor.getId(),
																					'lineIn': scene.getOpeningLine(),
																					'lineOut': response['body'].toString().replace(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]+Z/g, '')});
																					
									// If the first tier does not have any lines, we need to run it and its dependencies in isolation to capture the lines
									scene.getLine(newLine, function(line){
										
										if(line != undefined){
											// If the lines returned match the lines stored in the DB then the test passed
											if(line.getLineOut() == newLine.getLineOut()){
												console.log('SUCCESS: ' + newLine.getLineOut());
												critic.record({'type': 'success', 'scene': scene.getId(), 'actor': actor.getId()});
												
											}else{
												// otherwise the test failed
												console.log('FAILURE: GOT - ' + newLine.getLineOut() + '  --- EXPECTED - ' + line.getLineOut());
												critic.record({'type': 'failure', 'scene': scene.getId(), 'actor': actor.getId(),
																							'expected': line.getLineOut(), 'actual': newLine.getLineOut()});
											}
											linesRead++;
										
										}else{
											console.log('RECORDING: ' + response['body'].toString());
											// the test was never recorded in the DB, so store the lines
											newLine.save(function(success){
												critic.record({'type': 'recording', 'scene': scene.getId(), 'actor': actor.getId(), 'actual': newLine.getLineOut()});
																							
												linesRead++;
											});
										}
										
									});
									
								}); // call to _rehearse
								
							}); // each actor
							
							// We likely don't need to do these intervals, the plays/acts/scenes can run asynchronously!!
							var doneReading = setInterval(function(){
								if(linesRead >= _.size(tiers[firstTier])){
									clearInterval(doneReading);
									scenesCompleted++;
								}
							}, 10);
							
						});  // each scene
						
						var doneWithScenes = setInterval(function(){
							if(scenesCompleted >= _.size(scenes)){
								clearInterval(doneWithScenes);
								actsCompleted++;
							}
						}, 10);
						
					}); // get scenes
					
				}); // each act
				
				var doneWithActs = setInterval(function(){
					if(actsCompleted >= _.size(acts)){
						clearInterval(doneWithActs);
						callback();
					}
				}, 10);
				
			});  // get acts
			
		} // waitForTiers interval
		
	});
};

// -----------------------------------------------------------------------------------------------
Script.prototype.dressRehearsal = function(critic, actors, callback){
	var _self = this,
			count = 0,
			tiers = {};
	
	_.forEach(actors, function(actor){
		if(!tiers[actor.getLevel()]) tiers[actor.getLevel()] = [];
		
		tiers[actor.getLevel()].push(actor);
		count++;
	});
	
	var waitForTiers = setInterval(function(){
		if(count >= _.size(actors)){
			clearInterval(waitForTiers);
			
			var firstTier = _.first( _.sortBy( _.keys(tiers), function(tier){ return tier; } ) ),
					lastTier = _.last( _.sortBy( _.keys(tiers), function(tier){ return tier; } ) );
				
			_self.play.getActs(function(acts){
				var actsCompleted = 0;
		
				console.log('PLAY: ' + _self.play.getTitle());

				_.forEach(acts, function(act){
					console.log('.. ACT: ' + act.getTitle());
		
					act.getScenes(function(scenes){
						var scenesCompleted = 0;
					
						_.forEach(scenes, function(scene){
							var linesRead = 0;
						
							console.log('.... SCENE: ' + scene.getOpeningLine());

							_.forEach(tiers[firstTier], function(actor){
								var linesMemorized = false,
										openingLine = scene.getOpeningLine();
									
								// If the first tier does not have any lines, we need to run it and its dependencies in isolation to capture the lines
								if(!scene.hasLines(actor.id)){
									
									// Register a listener to capture calls made from the isolated actor to other actors
									_self.writer.addListener('request', function(request){
console.log('Adding listener to writer');

										_self._recordRequest(scene.getId(), request);
									});
									
									// Call the isolated service
									_self._rehearse(openingLine, actor, _self.stagehand.getIsolationUrl(actor.getSetName()), function(response){
										var newLine = new Line({'sceneId': scene.getId(),
																						'actorId': actor.getId(),
																						'lineIn': openingLine});

										if(actor.getSoliloquyOnly()){
											newLine['lineOut'] = response['body'];
											
										}else{
											// March down the rest of the tiers, passing the last line captured by the Writer as the opening line to the
											// next tier (should be done recursively) Use the 'path' returned by the Writer to determine which captured
											// message belongs to which actor. 
											
											// If the tier is marked as an external service call then we have reached the bottom and can reverse the order
													
													// Use the stagehand to translate the path stored by the Writer into the original URL for the actor
													// Send the openingLine captured by the Writer and record it and the response in the DB 

											
											// Now that all of the opening lines are stored along with the LIVE terminus entry, traverse back up through the 
											// tiers recording the lineOuts.
											// Loop through the tiers starting at the bottom
												// Call the isolated service, but this time have the Writer pass back the lineOut from the recorded terminus actor
												// Retrieve the isolated actor's response and store it in the DB
												
												// Proceed up through the stack until all actor's linesIn and LinesOut have been recorded
										}
										
										newLine.save(function(success){

											console.log(response);
										});
										
									});
								
								}else{
									// The scene has been memorized by the DB, so just pass the opening line to the actors in the first Tier on the
									// MOCK framework. Have the writer return the lineOut for the appropriate terminus actors
									
									// If the lineOut retrieved does not match what is stored in the DB then recursively check the lineIn and Out 
									// for each actor to isolate the failure.
									
									// Otherwise record the success!
									
								}
									
								linesRead++;
							
							}); // each actor
							
							var doneReading = setInterval(function(){
								if(linesRead >= _.size(tiers[firstTier])){
									clearInterval(doneReading);
									scenesCompleted++;
								}
							}, 10);
						
						}); // each scene
					
						var doneWithScenes = setInterval(function(){
							if(scenesCompleted >= _.size(scenes)){
								clearInterval(doneWithScenes);
								actsCompleted++;
							}
						}, 10);
					});
				
				});
			
				var doneWithActs = setInterval(function(){
					if(actsCompleted >= _.size(acts)){
						clearInterval(doneWithActs);
						callback();
					}
				}, 10);
			});
				
		}
	}, 10);
};

// -----------------------------------------------------------------------------------------------
Script.prototype._recordRequest = function(sceneId, request){
	if(request['lineIn']){
		new Line({'sceneId': sceneId,
							'actorId': request['actor'],
							'lineIn': request['lineIn']}).save(function(success){});
	}
}

// -----------------------------------------------------------------------------------------------
Script.prototype._rehearse = function(line, actor, uri, callback){
	if(actor.getMethod().toUpperCase() != 'WS'){
		this._http(uri, line, actor, callback);
		
	}else{
		this._socket(uri, line, actor, callback);
	}
}

// -----------------------------------------------------------------------------------------------
Script.prototype._http = function(uri, line, actor, callback){
	var out = "",
			target = uri + actor.getRole(),
			handle = uuid.v4();

	if(actor.getMethod().toUpperCase() == 'GET'){
		target += (target.indexOf('?') < 0 ? '?' : (!['&', '?'].contains(line.slice(0, 1)) ? '&' : '')) + line;
	}

	var destination = url.parse(target);
		
	var options = {hostname: destination.hostname,
         				 port: destination.port,
           			 path: destination.path,
               	 method: actor.getMethod().toUpperCase(),
	               headers: {'Accept': actor.getResponds(),
							 	 					 'Rehearsal-Handle': handle}};

	if(actor.getMethod().toUpperCase() != 'GET'){
	  options.headers['Content-Type'] = actor.getAccepts();
	  options.headers['Content-Length'] = Buffer.byteLength(line);
	}

	var request = http.request(options, function(response){
	  // ---------------------------------------------------
	  response.setEncoding('utf8');

	  // ---------------------------------------------------
	  response.on('data', function(chunk){
	    out += chunk;
	  });

	  // ---------------------------------------------------
	  response.on('end', function(){
			callback({'body': out});
	  });

	});

	request.on('error', function(err){
	  callback('ERROR: calling ' + target + ': ' + err);

	  console.log('------------------------');
	  console.log(target + ' --> ' + err.message);
	  console.log(err.stack);
	  console.log('------------------------');
	});

	if(actor.getMethod().toUpperCase() != 'GET'){
	  request.write(line);
	}
	request.end();
}

// -----------------------------------------------------------------------------------------------
/*Script.prototype._socket = function(uri, line, actor, callback){
	var io = 
};*/

// -----------------------------------------------------------------------------------------------
Script.prototype._socket = function(uri, line, actor, callback){
	var out = "",
			transactionId = uuid.v4(),
			options = {'transports': ['websocket'],
								 'force new connection': true,
								 'reconnection': true,
							 	 'timeout': 100000},
			target = uri + actor.getRole(),
			parsedUrl = url.parse(uri);
								
	var io = require('socket.io-client');
			
console.log('Establishing websocket on: ' + target);

  var client = io.connect(target, options),
      ret = '';

  client.on('connect_error', function(err){ console.log('err: ' + err); console.log(err.stack); callback('ERROR!'); });
  client.on('reconnect_error', function(err){ console.log('reconnect err: ' + err); console.log(err.stack); callback('ERROR!'); });
  client.on('connect_timeout', function(err){ console.log('timed out!'); console.log(err.stack); callback('ERROR!'); });

  client.on('connect', function(data){

console.log('Websocket emitting --> ' + line);

    client.emit('openurl', line);

    client.on('citation', function (data) {
			ret += data.toString();
    });
    client.on('author', function (data) {
			ret += data.toString();
    });
    client.on('resource', function (data) {
			ret += data.toString();
    });

    client.on('error', function (data) {
			ret += data.toString();
    });

    client.on('complete', function (data) {
      client.disconnect();

console.log('socket completed: ' + ret);

      callback({'body': ret});
    });
  });

	client.on('error', function(err){
		console.log('WebSocket error: ' + err);
		console.log(err.stack);

		client.disconnect();
		callback({'body': 'WebSocket ERROR: ' + err});
	});

}


// -----------------------------------------------------------------------------------------------
Script.prototype._readLines = function(scene, protagonist, callback){
	
	console.log('reading line: ' + scene.getOpeningLine() + ' to ' + protagonist.getName());
};

// -----------------------------------------------------------------------------------------------
Script.prototype.rehearsal = function(critic, actors, callback){
	var _self = this;
	
	console.log('PLAY: ' + this.play.getTitle());
	
	this.play.getActs(function(acts){
		var act_count = 0;
		
		_.forEach(acts, function(act){
			
			console.log('.. ACT: ' + act.getTitle());
			
			// Rehearse each scene
			act.getScenes(function(scenes){
			
				var scene_count = 0;
			
				_.forEach(scenes, function(scene){
					
					console.log('.... SCENE: ' + scene.getOpeningLine());
					
					// Run through each actor (who should be in the correct order!)
					_.forEach(actors, function(protagonist){
						var done = false;

						// Process each antagonist's call to the protagonist
						if(protagonist.hasAntagonists()){
							
							protagonist.getAntagonists(function(antagonists){
								_.forEach(antagonists, function(antagonist){

									if(protagonist.hasTritagonists()){
										protagonist.getTritagonists(function(tritagonists){
											// Process the calls to each Tritagonist
											_.forEach(tritagonists, function(tritagonist){
										
												// Rehearse the the full antagonist <--> protagonist <--> tritagonist parts
												_self._practiceLines(scene, antagonist, protagonist, tritagonist, function(success){
													done = true;
												});
											});
										});
									
									}else{
										// There are no Tritagonists, so just rehearse the antagonist <--> protagonist part
										_self._practiceLines(scene, antagonist, protagonist, null, function(success){
											done = true;
										});
									}
								});
							});
								
							// No antagonists defined, so use the opening line
						}else{
							if(protagonist.hasTritagonists()){

								protagonist.getTritagonists(function(tritagonists){
									// Process the calls to each Tritagonist
									_.forEach(tritagonists, function(tritagonist){
										// Rehearse the the full openingLine <--> protagonist <--> tritagonist parts
										_self._practiceLines(scene, null, protagonist, tritagonist, function(success){
											done = true;
										});
									});
								});
								
							}else{
								// There are no Tritagonists, so just rehearse the openingLine <--> protagonist part
								_self._practiceLines(scene, null, protagonist, null, function(success){
									done = true;
								});
							}
						}
						
						// Setup interval to ensure that each group of protagonists run in order because the rehearsal
						// may require calls out to live systems to record lines
						var waitYourTurn = setInterval(function(){
							if(done){
								clearInterval(waitYourTurn);
								scene_count++;
							}
						}, 10);
					
					}); // forEach(actors)
					
				}); // forEach(scenes)
				
				var waitForScenes = setInterval(function(){
					if(scene_count >= _.size(scenes)){
						callback(true);
						clearInterval(waitForScenes);
					}
				},100)
				
			}); // act.getScenes()
		}); // forEach(acts)
	
		var waitForActs = setInterval(function(){
			if(act_count >= _.size(acts)){
				callback(true);
				clearInterval(waitForActs);
			}
		});
			
	});
	
};

// -----------------------------------------------------------------------------------------------
Script.prototype._practiceLines = function(scene, isFullDress, antagonist, protagonist, tritagonist, callback){
	var _self = this;
	
	if(protagonist != undefined){
		
		try{
			var aId = (antagonist != null ? antagonist.getId() : null),
					tId = (tritagonist != null ? tritagonist.getId() : null);
			
			new Line().load(scene.id, aId, protagonist.id, tId, function(line){
			
				var aName = (antagonist == null ? 'VOICE FROM AFAR' : antagonist.getName()),
						pName = protagonist.getName().toUpperCase(),
						tName = (tritagonist == null ? '' : tritagonist.getName());
		
			  // If the antagonist is undefined we need to use the opening line for the Scene
				if(antagonist == null) line.setLineFromAntagonist(scene.getOpeningLine());

				if(line.getLineFromAntagonist() != null){

					// If there is a Tritagonist
					if(tritagonist != null){
						// If the line to the Tritagonist is unknown, we need to capture it in the Proxy
						if(line.getLineToTritagonist() == null){
							//_self.writer.addListener(tritagonist.role, function(lineIn, lineOut){
						
								//});
						}
					}
	
					// If the response to the Antagonist is unknown, we need to go out and get it
					if(line.getResponseToAntagonist() == null){
					
						_self.stagehand.getCueCards(isFullDress, protagonist, line.getLineFromAntagonist(), function(response){
							if(response.indexOf('ERROR: ') != 0){
								line.setResponseToAntagonist(response.toString());
							
							}else{
								console.log(response);
							}
						});
					}
		
					var waitForAllLines = setInterval(function(){
						var triPassed = (tritagonist != null ? (line.getLineToTritagonist() != null && line.getResponseFromTritagonist() != null) : true);
					
						if(line.getResponseToAntagonist() != null && triPassed){
							console.log('\n...... ' + aName + ' to ' + pName + ': '+ line.getLineFromAntagonist());
			
							if(tritagonist != null){
								console.log('...... ' + pName + ' to ' + tName + ': ' + line.getLineToTritagonist());
								console.log('...... ' + tName + ' to ' + pName + ': ' + line.getResponseFromTritagonist());
							}
							console.log('...... ' + pName + ' to ' + aName + ': ' + line.getResponseToAntagonist());
						
							// Save the line for next time
							line.save(function(success){
								callback(success);
								
								clearInterval(waitForAllLines);
							});

						}
					},10);
	
				}else{
					console.log('\n...... Cannot read the lines for ' + pName + ' because we have no starting line! ');
					callback(false);
				}
		
			});
		}catch(err){
			console.log(err);
			console.log(err.stack);
			callback(false);
		}
		
	}else{
		console.log('The protagonist cannot be undefined!');
		callback(false);
	}
};
	
module.exports = Script;