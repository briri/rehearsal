var _ = require('underscore'),
    fs = require('fs');
		
var Stagehand = require('./lib/stagehand'),
    Writer = require('./lib/writer'),
    Critic = require('./lib/critic'),
    Actor = require('./lib/model/actor'),
    Play = require('./lib/model/play'),
		Script = require('./lib/script');
    
var firstTime = true,
    play_count = 1,
    plays_completed = 0,
    stagehand = undefined,
		writer = undefined;
		
// Wait for all of the plays to complete!
var waitUntilDone = setInterval(function(){
  
  if(firstTime){
    // Clear out the old temp directory
    deleteFolderRecursive('./tmp', function(){
      
      // Assign a Script Writer
      writer = new Writer();
			
      // Get the Actors ready
      console.log('\nHolding auditions.');
      
			stagehand = new Stagehand(function(success){
				if(success){
					var fatal = false;
				
					writer.findAllActors(function(actors){
					//Actor.findAll( {where: {active: true}, order: ['level', 'name']} ).success(function(actors){		
		        // Load plays
		        writer.findAllPlays(function(plays){
			
		          plays_count = plays.length;

							// Wait for the servers to startup and come online
							setTimeout(function(){
			          _.forEach(plays, function(play){
									var script = new Script(writer, stagehand, play);
	              
									// Assign a Critic to review the play
		              var critic = new Critic();
								
									// Do the FULL STACK test
									script.fullDressRehearsal(critic, actors, function(){
										plays_completed++;
									});
								});
								
							}, 2000);
						});
					});
	        
				}else{
					console.log('A fatal error prevented the rehearsal from starting!');
				}
			});
			
      firstTime = false;
      
    });
  }

  if(plays_completed >= play_count){
    clearInterval(waitUntilDone);
    
		if(writer instanceof(Writer)) writer.close();
    if(stagehand instanceof(Stagehand)) stagehand.cleanup();
  }

}, 400);


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
    
  }else{
    // The directory doesn't exist
    callback();
  }
};
