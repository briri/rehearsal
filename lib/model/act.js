require('../init');

var Scene = require('./scene');

var Act = function(){
	this.id = undefined;
	this.title = '';
	this.scenes = [];
}

Act.prototype.load = function(id, callback){
	var _self = this;
	
	database.query('SELECT * FROM acts WHERE id = ? and active = 1', [id], function(err, rows){
		if(err){
			console.log(err);
			console.log(stack)
			
		}else{
			_self.id = rows[0].id;
			_self.title = rows[0].title;
		
			_self.scenes = [];
		
			database.query('SELECT id FROM scenes WHERE actId = ?', [id], function(err, rows){
				_.forEach(rows, function(row){ _self.scenes.push(row.id); });
				
				callback(_self);
			});
			
		}
	});
	
};

Act.prototype.getId = function(){ return this.id; };
Act.prototype.getTitle = function(){ return this.title; };

Act.prototype.hasScenes = function(){ return _.size(this.scenes) > 0; };
Act.prototype.getScenes = function(callback){ 
	var scenes = [];
	
	_.forEach(this.scenes, function(id){
		var obj = new Scene();
		obj.load(id, function(scene){
			scenes.push(scene);
		});
	});
	
	var waitForLoad = setInterval(function(){
		if(_.size(scenes) >= _.size(this.scenes)){
			callback(scenes);
			clearInterval(waitForLoad);
		}
	});
};

module.exports = Act;