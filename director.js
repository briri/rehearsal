var _ = require('underscore'),
		fs = require('fs'),
		Play = require('./lib/model/play'),
		Writer = require('./lib/writer'),
		Critic = require('./lib/critic');
		
var firstTime = true,
		play_count = 1,
		plays_completed = 0;

// Wait for all of the plays to complete!
var waitUntilDone = setInterval(function(){
	
	if(firstTime){
		// Clear out the old temp directory
		deleteFolderRecursive('./tmp', function(){
			// Load plays
			Play.findAll( {where: {active: true}} ).success(function(plays){
		
				plays_count = plays.length;
		
				_.forEach(plays, function(play){
					console.log('\nPLAY: ' + play.description);
			
					// Assign a Playwright
					var writer = new Writer();
			
					// Rehearse the play to make sure all Actor's know their lines
					play.rehearse(writer, function(){
				
						// Assign a Critic to review the play
						var critic = new Critic();
				
						// Perform Full Dress Rehearsal for the Critic
						play.perform(critic, function(){
					
							plays_completed++;
						});
			
					});
			
				});
			
			}).error(function(err){
				console.log('Unable to see the play schedule!');
				console.log(err);
			});
		
			firstTime = false;
			
		});
		
	}


	if(plays_completed >= play_count) clearInterval(waitUntilDone);
}, 1000);


var deleteFolderRecursive = function(path, callback) {
	if(fs.existsSync(path)){
		
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath, function(){});
				
			}else{ // delete file
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(path);
		callback();
	}
};
