var sys = require('sys'),
    fs = require('fs'),
    nock = require('nock'),
    child = require('child_process'),
    spawn = child.spawn;
    
var Stagehand = function(actors, callback){
  
  this.live_systems = {};
  this.mock_systems = {};
  
  console.log('.... For:');
  
  var _self = this,
      total_servers = actors.length,
      ready_servers = 0;
  
  fs.exists('./tmp', function(exists){
    if(!exists) fs.mkdirSync('./tmp');
  });
  
  var unique_servers = {},
      mock_servers = {};
  
  // Find the unique repositories
  _.forEach(actors, function(actor){
    console.log('...... ' + actor.name);
    
    if(actor.repository != null){
      if(unique_servers[actor.repository] == undefined){
        unique_servers[actor.repository] = actor;
        total_servers++;
      }
    }
  });

  // Prepare the live systems
  _.forEach(unique_servers, function(actor, repo){
    _self._startupLiveSystem(actor, function(){
      ready_servers++;
    });
  });
  
  // Prepare the mock systems
  _.forEach(actors, function(actor){
    _self._startupMockSystem(actor, function(){
      ready_servers++;
    });
  });
  
  var waitForActors = setInterval(function(){
    console.log('waiting for Actors ' + ready_servers + ' out of ' + total_servers);
    
    if(ready_servers >= total_servers){
      clearInterval(waitForActors);
      
      console.log('\n.... All actors are ready');
      
      callback();
    }
  }, 500);
};

// ------------------------------------------------------------------------------------------------
Stagehand.prototype._startupMockSystem = function(actor, callback){
  var opts = {};
  
  if(actor.rehearsal_uri_filter != null) opts['filteringScope'] = function(scope){ return actor.rehearsal_uri_filter.test(scope); };
  
  this.mock_systems[actor.name] = nock(actor.rehearsal_uri, opts);
  
  callback();
};

// ------------------------------------------------------------------------------------------------
Stagehand.prototype._startupLiveSystem = function(actor, callback){
  var running = false,
      fatal = false,
      opts = {cwd: process.cwd(),
              env: process.env},
      _self = this;
  
  var repo_name = actor.repository.match(/\/[\w]+.git/)[0].replace('/', '').replace('.git', '');
    
  fs.exists('./tmp/' + repo_name, function(exists){
    
    // If the repo doesn't exist, go get it from GitHub
    if(!exists){
      var cmd = actor.clone_command.split(' ');
      
      var cloner = spawn(cmd[0], [cmd[1], actor.repository], {cwd: process.cwd() + '/tmp', 
                                                              env: process.env, 
                                                              stdio: ['pipe', process.stdout, process.stderr]});
      
      cloner.on('close', function(code){ 
        if(code != 0){
          console.log('Unable to clone the repository for ' + actor.name + ': ' + code);
          fatal = true;
          
        }else{      
          cmd = actor.install_command.split(' ');
          
          var builder = spawn(cmd[0], [cmd[1]], {cwd: process.cwd() + '/tmp/' + repo_name, 
                                                      env: process.env, 
                                                      stdio: ['pipe', process.stdout, process.stderr]});
  
          builder.on('close', function(code){
            if(code != 0){
              console.log('Unable to build ' + actor.name + ': ' + code);
              fatal = true;
          
            }else{
              var starter = child.exec(actor.start_command, {cwd: process.cwd() + '/tmp/' + repo_name, 
                                                                              env: process.env}, function(error, stdout, stderr){
                
                if(error !== null) console.log('error stating ' + actor.name + ': ' + error);
              });
              
            }
          });
        }
      });
      
			var tries = 0;
      var waitForStartup = setInterval(function(){
        console.log('waiting for ' + actor.name + ' to startup.');
        
        fs.exists('./tmp/' + repo_name + '/' + actor.pid_location, function(exists){
          if(exists){
            fs.readFile('./tmp/' + repo_name + '/' + actor.pid_location, function(err, data){
              if(err) throw err;
              
              _self.live_systems[actor.name] = data.toString().replace('\r', '').replace('\n', '');
              
              clearInterval(waitForStartup);
              callback();
            });
          
          }else{
            // Limit the number of tries so this can bail out if the PID never gets created but warn the user
            if(tries >= 50){
              clearInterval(waitForPid); 
              
              console.log('No pid found once ' + actor.name + ' was started. ' +
                                'Looked in ' + process.cwd() + '/tmp/' + repo_name + '/' + actor.pid_location + '.' +
                                ' You may need to stop it manually!');
                                
              clearInterval(waitForStartup);
              callback();
              
            }else{
              tries++;
            }
          }  
        });
        
      }, 500);
      
    }else{
      callback();
    }
  });
};

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.cleanup = function(){
  console.log('\nBreaking down the set.');
  
  // Shut down each running component
  _.forEach(this.live_systems, function(process, name){
    console.log('.. Retrieving script and wardrobe from ' + name + ' (pid ' + process + ')');
    
    child.exec('kill -9 ' + process);
  });
};

module.exports = Stagehand;

