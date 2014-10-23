require('../init');

var Actor = function(){
	this.id = undefined;
	this.level = '';
	this.name = '';
	this.setName = '';
	this.role = '';
	this.method = 'GET';
	this.accepts = 'text/html';
	this.responds = 'text/html';
	this.soliloquyOnly = false;
}

Actor.prototype.load = function(id, callback){
	var _self = this;
	
	database.query('SELECT * FROM actors WHERE id = ? and active = 1', [id], function(err, rows){
		_self.id = rows[0].id;
	  _self.level = rows[0].level;
		_self.name = rows[0].name;
	  _self.setName = rows[0].setName;
	  _self.role = rows[0].role;
		_self.method = rows[0].method;
		_self.accepts = rows[0].accepts;
		_self.responds = rows[0].responds;
		_self.soliloquyOnly = rows[0].soliloquyOnly;

		_self.antagonists = [];
		_self.tritagonists = [];
		
		database.query('SELECT antagonistsId FROM antagonists WHERE actorId = ?', [id], function(err, rows){
			_.forEach(rows, function(row){ _self.antagonists.push(row.antagonistsId); });
			
			database.query('SELECT tritagonistsId FROM tritagonists WHERE actorId = ?', [id], function(err, rows){
				_.forEach(rows, function(row){ _self.tritagonists.push(row.tritagonistsId); });
				
				callback(_self);
			});
		});
		
	});
};

Actor.prototype.getId = function(){ return this.id; };
Actor.prototype.getLevel = function(){ return this.level; };
Actor.prototype.getName = function(){ return this.name; };
Actor.prototype.getSetName = function(){ return this.setName; };
Actor.prototype.getRole = function(){ return this.role; };
Actor.prototype.getMethod = function(){ return this.method; };
Actor.prototype.getAccepts = function(){ return this.accepts; };
Actor.prototype.getResponds = function(){ return this.responds; };
Actor.prototype.getSoliloquyOnly = function(){ return this.soliloquyOnly; };

Actor.prototype.hasAntagonists = function(){ return _.size(this.antagonists) > 0; };
Actor.prototype.getAntagonists = function(callback){ 
	var antagonists = [];
	
	_.forEach(this.antagonists, function(id){
		var obj = new Actor();
		obj.load(id, function(antagonist){
			antagonists.push(antagonist);
		})
	});
	
	var waitForLoad = setInterval(function(){
		if(_.size(antagonists) >= _.size(this.antagonists)){
			callback(antagonists);
			clearInterval(waitForLoad);
		}
	});
};

Actor.prototype.hasTritagonists = function(){ return _.size(this.tritagonists) > 0; };
Actor.prototype.getTritagonists = function(callback){ 
	var tritagonists = [];
	
	_.forEach(this.tritagonists, function(id){
		var obj = new Actor();
		obj.load(id, function(tritagonist){
			tritagonists.push(tritagonist);
		})
	});
	
	var waitForLoad = setInterval(function(){
		if(_.size(tritagonists) >= _.size(this.tritagonists)){
			callback(tritagonists);
			clearInterval(waitForLoad);
		}
	});
};


module.exports = Actor;
