var Act = require('./act');

var Play = function(){
  this.id = undefined;
  this.title = '';
  this.acts = [];
}

// ---------------------------------------------------------
Play.prototype.load = function(id, callback){
  var _self = this;
  
  database.query('SELECT * FROM plays WHERE id = ? AND active = 1', [id], function(err, rows){
    if(err){
      console.log(err);
      console.log(err.stack);
    
    }else{
      if(rows != undefined){
        _self.id = rows[0].id;
        _self.title = rows[0].title;
    
        _self.acts = [];
    
        database.query('SELECT id FROM acts WHERE playsId = ? AND active = 1', [id], function(err, rows){
          _.forEach(rows, function(row){ _self.acts.push(row.id); });
          
          callback(_self);
        });
      }
    }
    
  });
};

// ---------------------------------------------------------
Play.prototype.getId = function(){ return this.id; };
Play.prototype.getTitle = function(){ return this.title; };

// ---------------------------------------------------------
Play.prototype.hasActs = function(){ return _.size(this.acts) > 0; };
Play.prototype.getActs = function(callback){ 
  var acts = [],
      total = _.size(this.acts);

  _.forEach(this.acts, function(id){
    var obj = new Act();
    obj.load(id, function(act){
      acts.push(act);
    });
  });
  
  var waitForLoad = setInterval(function(){    
    if(_.size(acts) >= total){
      clearInterval(waitForLoad);
      callback(acts);
    }
  });
};

module.exports = Play;