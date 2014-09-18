
var Writer = require('./lib/writer'),
	  actor = require('./lib/actor.js'),
		_ = require('underscore');

var writer = new Writer(),
		startup = true,
		complete = false,
		counter = 0,
		plays = writer.getPlays();

var main = setInterval(function(){
	if(startup){
		startup = false;
				
		_.forEach(plays, function(play){
			console.log('Rehearsing a new play called: ' + play.description);
			var act_counter = 1;
			
			_.forEach(play.getActs(), function(act){
				console.log('\n.. ---------------------------------------------------------');
				console.log('.. ACT ' + act_counter + ': ' + act.title);
				var scene_counter = 1;
				
				if(act.getScenes().length > 0){
					
					_.forEach(act.getScenes(), function(scene){
						console.log('\n.... SCENE ' + scene_counter + ':');
						
						if(scene.antagonist.readLine() == null){
							console.log('...... ' + scene.antagonist.getName() + ' has no opening line!');
						
						}else{
							if(scene.protagonist.readLine() == null){
								console.log('...... ' + scene.protagonist.getName() + ' has forgetten its line and will be using a cue card!');
								
							}
							
							if(scene.tritagonist.respond() == null){
								console.log('...... ' + scene.tritagonist.getName() + ' has forgetten its response and will be using a cue card!');
							}
						
							console.log('...... ' + scene.antagonist.getName() + ' to ' + scene.protagonist.getName() + ': ' + scene.antagonist.readLine());
							console.log('\n...... ' + scene.protagonist.getName() + ' to ' + scene.tritagonist.getName() + ': ' + scene.protagonist.readLine());
							console.log('\n...... ' + scene.tritagonist.getName() + ' to ' + scene.protagonist.getName() + ': ' + scene.tritagonist.respond());
							console.log('\n...... ' + scene.protagonist.getName() + ' to ' + scene.antagonist.getName() + ': ' + scene.protagonist.respond());
						
							// Compare 
						}
						
						scene_counter++;
					});
					
				}else{
					console.log('.... SCENE ' + scene_counter + ': is unfinished. No actors have been cast!');
				}
				
				act_counter++;
			});
			
/*			actor.listen(3101, function(){
			  console.log('... The SFX actor has entered stage right.');
			});*/
			
			counter ++;
		});
		
	}else if(counter >= plays.length){
		clearInterval(main);
		writer.retire();
	}
	
}, 1000);


