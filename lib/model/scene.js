require('../init');

var Line = require('./line');

var Scene = function(){
	this.id = undefined;
	this.openingLine = '';
	this.lines = {};
}

// -----------------------------------------------------------------------------------------------
Scene.prototype.load = function(id, callback){
	var _self = this;
	
	database.query('SELECT * FROM scenes WHERE id = ? and active = 1', [id], function(err, rows){
		if(err){
			console.log(err);
			console.log(stack)
			callback(undefined);
			
		}else{
			_self.id = rows[0].id;
			_self.openingLine = rows[0].openingLine;
			
			database.query('SELECT actorId, id FROM script WHERE sceneId = ?', [id], function(err, rows){
				_.forEach(rows, function(row){ 
					if(_self.lines[row.actorId] == undefined) _self.lines[row.actorId] = [];
					_self.lines[row.actorId].push(row.id); 
				});
				
				callback(_self);
			});
		}
	});
	
};

// -----------------------------------------------------------------------------------------------
Scene.prototype.getId = function(){ return this.id; };
Scene.prototype.getOpeningLine = function(){ return this.openingLine; };
// -----------------------------------------------------------------------------------------------
Scene.prototype.hasLines = function(actorId){ return _.size(this.lines[actorId]) > 0; };
Scene.prototype.getLine = function(lineIn, callback){  
	var ret = undefined,
			checked = 0,
			total = _.size(this.lines[lineIn.getActorId()]),
			_self = this;
	
	_.forEach(this.lines[lineIn.getActorId()], function(id){
		var obj = new Line({});
		obj.load(id, function(line){
			if(line.equals(lineIn)){
				ret = line;
			}
			checked++;
		});
	});
	
	var waitForSearch = setInterval(function(){
		if(checked >= total){
			clearInterval(waitForSearch);
			callback(ret);
		}
	});
};

module.exports = Scene;
