/*
 * Should probably make this a Listener on the Script object, and store the results in the DB! 
 * 
 * May also be useful to record the version numbers (git tags/commit ids) of all the cedilla components/sets 
 */
var Critic = function(play){
  this.play = play;  
  this.reviews = {};
}

// ----------------------------------------------------------------------------------------------
Critic.prototype.record = function(type, act, scene, actor, actual, expected){
  
  if(this.reviews[type] == undefined) this.reviews[type] = {};
  if(this.reviews[type][act] == undefined) this.reviews[type][act] = {};
  if(this.reviews[type][act][scene] == undefined) this.reviews[type][act][scene] = [];

  this.reviews[type][act][scene].push({'actor': actor, 'actual': actual, 'expected': expected});
  
// Could probably just do the writing here as the records come in, so if a fatal error occurs we can see which one it was working on!
}

// ----------------------------------------------------------------------------------------------
Critic.prototype.writeReview = function(callback){
  var today = new Date(),
      _self = this,
      file = process.cwd() + '/review-play' + this.play.getId() + '-' + today.getFullYear() + '-' + 
                                                                        (today.getMonth() + 1) + '-' + 
                                                                        today.getDate() + '_' +
                                                                        today.getHours() + today.getMinutes() + today.getSeconds() + '.log';
  
  var ws = fs.createWriteStream(file, {flags: 'w', encoding: 'utf8', mode: 0666})
  
  ws.on('open', function(fd){
    ws.write('REVIEW OF PLAY: ' + _self.play.getTitle() + '\n--------------------------------------------------------------\n');
                                                                    
    _.forEach(_self.reviews, function(acts, type){
      ws.write('\n' + type.toUpperCase() + '\n-----------------------------------------\n');
    
      _.forEach(acts, function(scenes, act){
        ws.write('ACT: ' + act + '\n');
      
        _.forEach(scenes, function(actors, scene){
          ws.write('  SCENE: ' + scene + '\n');
        
          _.forEach(actors, function(hash){
            ws.write('    ACTOR: ' + hash['actor'] + '\n');
          
            if(hash['actual'] != undefined) ws.write('      ACTUAL: ' + hash['actual'] + '\n');
            if(hash['expected'] != undefined) ws.write('      EXPECTED: ' + hash['expected'] + '\n');

            ws.write('    --------------------\n');
          });
        
          ws.write('\n');
        });
      });
    
      ws.write('\n');
    });
    
    ws.end();
  });  
  
  ws.on('finish', function(){
    callback("Completed the rehearsal for Play-" + _self.play.getTitle() + " check the critic's review at " + file + " for full details!");
  });

}

module.exports = Critic;