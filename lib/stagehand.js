var sys = require('sys'),
    fs = require('fs'),
    ncp = require('ncp'),
    url = require('url'),
    child = require('child_process'),
    spawn = child.spawn;

var Stagehand = function(callback){
  
  this.activeSets = [];

  this.metaSets = {};
  
  this.rewrites = {};

  // Build out the tmp directory if it doesn't exist
  fs.exists('./tmp', function(exists){
    if(!exists) fs.mkdirSync('./tmp');
  });

  // ------------------------------------------------------------------------------------------------
  var retrieveSet = function(name, options, callback){
    this
    
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
        
        try{
          var builder = spawn(cmd[0], cmd.slice(1), {cwd: process.cwd() + '/tmp/' + name,
                                                     env: process.env,
                                                     stdio: ['pipe', process.stdout, process.stderr]}); //'pipe', 'pipe']});
                                                     
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
            var dir = process.cwd() + '/tmp/mocks/' + name + options['config_location'];
            
            // Rewrite any outbound http traffic in the configs so that they go to our proxy
            rewriteConfigurationSettings(name, dir, options, function(rewrites){
              callback(rewrites);
            });
          }
        });
      }
    });
  };
  
  // ------------------------------------------------------------------------------------------------
  var installSet = function(name, options, mocking, callback){
    var dir = process.cwd() + '/tmp/' + (mocking ? 'mocks/' : '') + name;
  
    var tries = 0,
        _self = this;

    fs.exists(dir, function(exists){
      if(exists){
        var start = (mocking ? options['start_command'].replace(options['live_port'], options['mock_port']) : options['start_command']);
        
        child.exec(start, {cwd: dir, env: process.env}, function(error, stdout, stderr){
          if(error !== null){
            console.log('error starting ' + name + ': ' + error);
            callback(undefined);
          }
        });
      
        var waitForStartup = setInterval(function(){
          fs.exists(dir + '/' + options['pid_location'], function(exists){
            if(exists){
              fs.readFile(dir + '/' + options['pid_location'], function(err, data){
                if(err) throw err;
              
                clearInterval(waitForStartup);
                console.log(name + ' is now listening on ' + (mocking ? options['mock_port'] : options['live_port']));
                callback(data.toString().replace('\r', '').replace('\n', ''));
              });
          
            }else{
              // Limit the number of tries so this can bail out if the PID never gets created but warn the user
              if(tries >= 20){
                console.log('No pid found once ' + name + ' was started. Please check the sets.yml to make sure the correct location is specified.');
                                
                clearInterval(waitForStartup);
                callback(undefined);
              
              }else{
                tries++;
              }
            }  
          });
        }, 300);
      
      }else{
        console.log('Unable to start ' + name + ' because it could not be found at: ' + dir);
      }
    });
  };
  
  // ------------------------------------------------------------------------------------------------
  var rewriteConfigurationSettings = function(name, dir, options, callback){
    var ret = {},
        _self = this;
    
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
                        var newConfig = data,
                            partsRewritten = 0;
                        
                        _.forEach(options['rewrite_lines_for_mocking'], function(hash){
                          var matches = [];
                          
                          // Rewrite ALL http calls to match the value specified
                          if(hash['from'] == 'ALL'){
                            matches = data.match(/http[s]?:\/\/([\w\{\}]+\.){1,2}[\w]{2,3}(:[\d]+)?/g);
                                              
                          }else{
                            // Else only rewrite the specified url
                            var from = new RegExp(hash['from'], "g");
                            matches = data.match(from);
                          }
                          
                          // Rewrite the targets
                          _.forEach(matches, function(match){
                            var regex = new RegExp(match, 'g');
                            newConfig = newConfig.replace(regex, hash['to']);
                            
                            // Record any of the URLs that got rewritten
                            if(ret[hash['to']] == undefined) ret[hash['to']] = [];
                            
                            regex = new RegExp(match + '([\\w\\.\\?/])+', "g");
                            var fullTarget = data.match(regex);
                            
                            _.forEach(fullTarget, function(target){
                              if(!_.contains(ret[hash['to']], target)){
                                ret[hash['to']].push(target);
                              }
                            }) 
                          });
                          
                          partsRewritten++;
                        });  
                        
                        var contentPrepped = setInterval(function(){
                          if(partsRewritten >= _.size(options['rewrite_lines_for_mocking'])){
                            clearInterval(contentPrepped);
                            
                            fs.writeFile(dir + '/' + file, newConfig, 'utf8', function(err){
                              count++;
                            });
                          }
                        });
                            
                      }else{
                        console.log('Warning: ' + dir + '/' + file + ' is empty!');
                        count++;
                      }
                    });
                  }
                });
                
              }else{
                // This is a subdirectory so recursively rewrite its files
                fs.stat(dir + '/' + file, function(err, stats){
                  if(stats.isDirectory()){
                    rewriteConfigurationSettings(name, dir + '/' + file, options, function(rewrites){
                      _.forEach(rewrites, function(froms, to){
                        _.forEach(froms, function(from){
                          ret[to].push(from);
                        });
                      });
                      count++;
                      
                    });
                    
                  }else{
                    count ++;
                  }
                });
              }
            });
    
            var waitForRewrites = setInterval(function(){
              if(count >= _.size(files)){
                clearInterval(waitForRewrites);
                callback(ret);
              }
            }, 100);
          }
        });
        
      }else{
        callback(false);
      }
    }, 100);
  };
  
  
  // ------------------------------------------------------------------------------------------------
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
        var meta = _self.metaSets[name];
        if(meta == undefined) meta = {'mock_port': def['mock_port'],
                                      'live_port': def['live_port'],
                                      'external_targets': []};
        
        retrieveSet(name, def, function(success){
          if(success){ 
            
            // Build the newly retrieved Set
            buildSet(name, def, function(success){
              if(success){ 
                
                // Build the codebase for the MOCK
                buildMockSet(name, def, function(rewrites){
                  
                  _.forEach(rewrites, function(froms, to){
                    if(_self.rewrites[to] == undefined) _self.rewrites[to] = [];
                    
                    _.forEach(froms, function(from){
                      _self.rewrites[to].push(from);
                    });
                  });
                  
                  //meta['external_targets'] = uris;
                 
                  // Startup the LIVE system
                  installSet(name, def, false, function(pid){
                    if(pid != undefined){
                      _self.activeSets.push(pid);
                      
                      // Startup the MOCK system
                      installSet(name, def, true, function(pid){
                        if(pid != undefined){
                          _self.activeSets.push(pid);
                          sets++; 

                        }else{
                          fatal = true;
                        }
                      });
                      
                    }else{
                      fatal = true;
                    }
                  });
                  
                });
                
              }else{ 
                fatal = true; 
              }
            });
            
          }else{ 
            fatal = true; 
          }
        });
        
        _self.metaSets[name] = meta;
      });
      
      var waitForSets = setInterval(function(){
        if(fatal || sets >= _.size(_self.setConfig['sets'])){
          clearInterval(waitForSets);
          callback(!fatal);
        }
      }, 200);
      
    }
  }, 100);

}

Stagehand.prototype.getOriginalUrl = function(uri){
  var target = url.parse(uri);
  
console.log('Hostname: ' + target.hostname);
console.log('Port: ' + target.port);
console.log('Path: ' + target.path);
console.log('Protocol: ' + target.protocol);
  
//  _.find(this.rewrites[target], function())
}


// ------------------------------------------------------------------------------------------------
Stagehand.prototype.addActiveSetIdentifier = function(pid){ this.activeSets.push(pid); };
Stagehand.prototype.removeActiveSetIdentifier = function(pid){ this.activeSets.slice(this.activeSets.indexOf(pid), 1)}

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.getSetMetadata = function(setName){ return this.metaSets[setName] };

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.getLiveUrl = function(setName){ console.log(setName); return 'http://localhost:' + this.metaSets[setName]['live_port'] }
Stagehand.prototype.getMockUrl = function(setName){ return 'http://localhost:' + this.metaSets[setName]['mock_port']; }

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.getCueCards = function(actor, startingLine, callback){
  var http = require('http'),
      out = '',
      target = 'http://localhost:' + this.metaSets[actor.getSetName()]['mock_port'] + actor.getRole();
      
      
  if(actor.getMethod().toUpperCase() == 'GET'){
    target += (target.indexOf('?') < 0 ? '?' : (!['&', '?'].contains(startingLine.slice(0, 1)) ? '&' : '')) + startingLine;
  }
      
  var destination = url.parse(target)
  
  var options = {hostname: destination.hostname,
                   port: destination.port,
                   path: destination.path,
                   method: actor.getMethod().toUpperCase(),
                   headers: {'Accept': actor.getResponds()}};

  if(actor.getMethod().toUpperCase() != 'GET'){
    options['Content-Type'] = actor.getAccepts();
    options['Content-Length'] = Buffer.byteLength(startingLine);
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
      callback(out);
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
    request.write(startingLine.toString());
  }
  request.end();
};

// ------------------------------------------------------------------------------------------------
Stagehand.prototype.cleanup = function(callback){
  console.log('\nBreaking down the sets.');
  
  // Shut down each running component
  _.forEach(this.activeSets, function(process){
    console.log('killing ' + process);
    child.exec('kill -9 ' + process);
  });
  
  this.activeSets = [];
};

module.exports = Stagehand;

