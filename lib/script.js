var events = require('events'),
		util = require('util'),
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
Script.prototype.rehearse = function(critic, actors, callback){
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
Script.prototype._practiceLines = function(scene, antagonist, protagonist, tritagonist, callback){
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
					
						_self.stagehand.getCueCards(protagonist, line.getLineFromAntagonist(), function(response){
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