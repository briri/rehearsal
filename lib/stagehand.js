var sys = require('sys'),
    fs = require('fs'),
    ncp = require('ncp'),
    child = require('child_process'),
    spawn = child.spawn;

var Stagehand = function(callback){
  
  this.activeSets = [];

  // Build out the tmp directory if it doesn't exist
  fs.exists('./tmp', function(exists){
    if(!exists) fs.mkdirSync('./tmp');
  });

  // ------------------------------------------------------------------------------------------------
  var retrieveSet = function(name, options, callback){
    fs.exists('./tmp/' + name, function(exists){
      if(!exists){
        // Clone the system's repository
        var cmd = options['retrieval_command'].split(' ');
        
        try{
          var cloner = spawn(cmd[0], [cmd[1], options['repository_uri']], {cwd: process.cwd() + '/tmp', 
                                                                  env: process.env, 
                                                                  stdio: ['pipe', process.stdout, process.stderr]});
      
          cloner.on('close', function(code){ 
            if(code != 0){
              console.log('Unable to retrieve ' + name + ': ' + code);
              callback(false);
          
            }else{      
              // Swap in any configuration from the local environment specific repository
              if(options['config_replacement']){
                var links = 0,
                    dir = process.cwd() + '/tmp/' + name + options['config_location'];
                
                fs.exists(dir, function(exists){
                  if(exists){
                    _.forEach(options['config_replacement'], function(rule){
                      _.forEach(rule['files'], function(file){
                        try{
                          var filename = file.match(/\/[\w]*.y[a]?ml/)[0].replace('/', '');
                          
                          ncp(process.cwd() + '/tmp/' + file, rule['dir'].replace('.', dir) + '/' + filename, function(err){
                            console.log('copying config from ' + process.cwd() + '/tmp/' + file + ' >> ' + rule['dir'].replace('.', dir) + '/' + filename);
                          });
                        }catch(err){
                          console.log(err);
                        }
                      });
                      
                    });
                    
                  }else{
                    console.log('The config directory specified in the sets.yml for ' + name + ' does not exist!');
                    callback(false);
                  }
                  links++;
                });
              }
              callback(true);
              
            }
          });
          
        }catch(err){
          console.log('Error retrieving ' + name + ': ' + err);
          callback(false);
        }
      }
    });
  };

  // ------------------------------------------------------------------------------------------------
  var buildSet = function(name, options, callback){
    fs.exists('./tmp/' + name, function(exists){
      if(exists){
        var cmd = options['build_command'].split(' ');
        
        console.log(process.cwd() + '/tmp/' + name);
        
        try{
          var builder = spawn(cmd[0], cmd.slice(1), {cwd: process.cwd() + '/tmp/' + name,
                                                     env: process.env,
                                                     stdio: ['pipe', 'pipe', 'pipe']});//process.stdout, process.stderr]});
                                                     
          builder.on('close', function(code){
            if(code != 0){
              console.log('Unable to build ' + name + ': ' + code);
              callback(false);
          
            }else{      
              callback(true);
            }
          });
          
        }catch(err){
          console.log('Error building ' + name + ': ' + err);
          callback(false);
        }
      }
    });
      callback(true);
  };
  
  // ------------------------------------------------------------------------------------------------
  var buildMockSet = function(name, options, callback){
    fs.exists('./tmp/' + name, function(exists){
      if(exists){
        // Copy the live code to the mocks directory
        ncp(process.cwd() + '/tmp/' + name, process.cwd() + '/tmp/mocks/' + name, function(err){
          if(err){
            console.log('Unable to create mock instance of ' + name + ': ' + err);
            callback(false);
            
          }else{
            console.log('./tmp/mocks/' + name + options['config_location']);
            var dir = process.cwd() + '/tmp/mocks/' + name + options['config_location'];
            
            // Rewrite any outbound http traffic in the configs so that they go to our proxy
            rewriteConfigurationSettings(dir, function(success){
              
              callback(success);
            });
          }
        });
      }
    });
  };
  
  // ------------------------------------------------------------------------------------------------
  var rewriteConfigurationSettings = function(dir, callback){
    var ret = true,
        proxy_uri = 'http://localhost:9099/proxy';
    
    fs.exists(dir, function(exists){
      if(exists){
        fs.readdir(dir, function(err, files){
          if(err){
            console.log('Warning - error reading configuration directory: ' + err);
            callbackl(false);
            
          }else{
            var count = 0;
          
            files.forEach(function(file){      
              // If the file is a YAML file
              if((file.indexOf('.yaml') > 0 || file.indexOf('.yml') > 0) && file.indexOf('.bak') < 0 && file.indexOf('.example') < 0){
                
                // Backup the original and make a new copy of the config so we can modify the URLs
                fs.rename(dir + '/' + file, dir + '/' + file + '.bak', function(err){
                  if(err){
                    console.log('Unable to backup ' + dir + '/' + file);
                    
                  }else{
                    fs.readFile(dir + '/' + file + '.bak', 'utf8', function(err, data){
                      if(data){

// TODO: We need to place these targets into the proxy so that it can handle the call

                        fs.writeFile(dir + '/' + file, 
                                     data.replace(/http[s]?:\/\/([\w\{\}]+\.){1,2}[\w]{2,3}/g, proxy_uri).
                                          replace(/http[s]?:\/\/localhost:[\d]+/g, proxy_uri),
                                     'utf8', function(err){
                          count++;
                        });
                        
                      }else{
                        console.log('Warning: ' + dir + '/' + file + ' is empty!');
                        count++;
                      }
                    });
                  }
                });
                
              }else{
                fs.stat(dir + '/' + file, function(err, stats){
                  if(stats.isDirectory()){
                    rewriteConfigurationSettings(dir + '/' + file, function(success){
                      ret = (ret ? success : false);
                      count++;
                      
                    });
                    
                  }else{
                    count ++;
                  }
                });
              }
            });
    
            var waitForRewrites = setInterval(function(){
              if(count >= files.length){
                clearInterval(waitForRewrites);
                callback(ret);
              }
            });
          }
        });
        
      }else{
        callback(false);
      }
    });
  };

  // ------------------------------------------------------------------------------------------------
  this.setConfig = yaml.load(fs.readFileSync(process.cwd() + '/config/sets.yml', 'utf8')),
      fatal = false;

  var _self = this;
  
  // Install any environment specific configuration repositories
  var configs = 0;
  _.forEach(this.setConfig['environment_specific_configuration'], function(def, name){
    retrieveSet(name, def, function(success){
      if(success){ configs++; }else{ fatal = true; }
    });
  });

  var waitForConfigs = setInterval(function(){
    // There was an issue building some component of the system so term the app
    if(fatal){
      clearInterval(waitForConfigs);
      callback(false);
      
    }else if(configs >= _.size(_self.setConfig['environment_specific_configuration'])){
      var sets = 0;
      
      // Build out the mock Sets directory if it doesn't exist
      fs.exists('./tmp/mocks', function(exists){
        if(!exists) fs.mkdirSync('./tmp/mocks');
      });
      
      clearInterval(waitForConfigs);
      
      // Retrieve all of the Sets
      _.forEach(_self.setConfig['sets'], function(def, name){
        retrieveSet(name, def, function(success){
          if(success){ 
            // Build the newly retrieved Set
            buildSet(name, def, function(success){
              if(success){ 
                
                buildMockSet(name, def, function(success){
                  if(success){
                    sets++; 
                    
                  }else{
                    fatal = true;
                  }
                });
                
              }else{ 
                fatal = true; 
              }
            });
            
          }else{ 
            fatal = true; 
          }
        });
      });
      
      var waitForSets = setInterval(function(){
        if(fatal || sets >= _.size(_self.setConfig['sets'])){
          clearInterval(waitForSets)
          callback(true);
        }
      }, 500);
      
    }
  }, 500);

}


// ------------------------------------------------------------------------------------------------
Stagehand.prototype.installSet = function(setName, mocking, callback){
  var dir = process.cwd() + '/tmp/' + (mocking ? 'mocks/' : '') + setName;
  
  var opts = this.setConfig['sets'][setName],
      tries = 0,
      _self = this;

  fs.exists(dir, function(exists){
    if(exists){
      child.exec(opts['start_command'], {cwd: dir, 
                                         env: process.env}, function(error, stdout, stderr){
        if(error !== null){
          console.log('error starting ' + name + ': ' + error);
          callback(false);
        }
      });
      
      var waitForStartup = setInterval(function(){
        console.log('waiting for ' + setName + ' to startup.');
        
        fs.exists(dir + '/' + opts['pid_location'], function(exists){
          if(exists){
            fs.readFile(dir + '/' + opts['pid_location'], function(err, data){
              if(err) throw err;
              
              _self.activeSets.push(data.toString().replace('\r', '').replace('\n', ''));
              
              clearInterval(waitForStartup);
              callback(true);
            });
          
          }else{
            // Limit the number of tries so this can bail out if the PID never gets created but warn the user
            if(tries >= 20){
              console.log('No pid found once ' + setName + ' was started. Please check the sets.yml to make sure the correct location is specified.');
                                
              clearInterval(waitForStartup);
              callback(false);
              
            }else{
              tries++;
            }
          }  
        });
      }, 500);
      
    }else{
      console.log('Unable to start ' + setName + ' because it could not be found at: ' + dir);
    }
  });
};

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.cleanup = function(){
  console.log('\nBreaking down the sets.');
  
  // Shut down each running component
  _.forEach(this.activeSets, function(process){
    child.exec('kill -9 ' + process);
  });
  
  this.activeSets = [];
};

module.exports = Stagehand;

