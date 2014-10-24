require('./lib/init');

var Stagehand = require('./lib/stagehand'),
    Writer = require('./lib/writer'),
    Critic = require('./lib/critic'),
    Play = require('./lib/model/play'),
    Script = require('./lib/script');
    
var firstTime = true,
    play_count = 1,
    plays_completed = 0,
    stagehand = undefined,
    writer = undefined,
    critic = undefined;
    
// Wait for all of the plays to complete!
var waitUntilDone = setInterval(function(){
  
  if(firstTime){
    // Clear out the old temp directory
    deleteFolderRecursive('./tmp', function(){
      
      // Get the Actors ready
      console.log('\nHolding auditions.');
      
      // Assign a Script Writer
      writer = new Writer(function(success){
        
        stagehand = new Stagehand(function(success){
        
          if(success){
            var fatal = false;
        
            // Wait for systems to come online
            console.log('Waiting a moment to give all systems a chance to come online');
            setTimeout(function(){
            
              writer.setStagehand(stagehand);
            
              writer.findAllActors(function(actors){
                // Load plays
                writer.findAllPlays(function(plays){
                  plays_count = plays.length;

                  // Wait for the servers to startup and come online
                  _.forEach(plays, function(play){
                    // Assign a Critic to review the play
                    var critic = new Critic(play);
                    
                    var script = new Script(writer, stagehand, play);
      
// THIS IS COMMENTED OUT SO WE CAN RUN AGAINST LIVE FOR THIS PHASE!
                    //script.dressRehearsal(critic, actors, function(){
      
                    script.audition(critic, actors, function(){
                      
                      critic.writeReview(function(res){
                        console.log(res);
                        plays_completed++;
                      });
                    });
                  });
        
                });
              });
        
            }, 4000);
        
          }else{
            console.log('A fatal error prevented the rehearsal from starting!');
          }
            
        });
        
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

// -----------------------------------------------------------------------------------------
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
