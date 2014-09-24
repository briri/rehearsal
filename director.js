var _ = require('underscore'),
    fs = require('fs'),
    Stagehand = require('./lib/stagehand'),
    Writer = require('./lib/writer'),
    Critic = require('./lib/critic'),
    Actor = require('./lib/model/actor'),
    Play = require('./lib/model/play');
    
var firstTime = true,
    play_count = 1,
    plays_completed = 0,
    stagehand = undefined;

// Wait for all of the plays to complete!
var waitUntilDone = setInterval(function(){
  
  if(firstTime){
    // Clear out the old temp directory
    deleteFolderRecursive('./tmp', function(){
      
      // Get the Actors ready
      console.log('\nHolding auditions.');
      
      Actor.findAll( {where: {active: true}} ).success(function(cast){
        
        stagehand = new Stagehand(cast, function(){
          
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
        });
        
      });
    
      firstTime = false;
      
    });
  }

  if(plays_completed >= play_count){
    clearInterval(waitUntilDone);
    
    if(stagehand instanceof(Stagehand)) stagehand.cleanup();
  }
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
    
  }else{
    // The directory doesn't exist
    callback();
  }
};
