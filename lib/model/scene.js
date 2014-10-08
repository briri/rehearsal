require('../init');

var Scene = function(){
	this.id = undefined;
	this.openingLine = '';
}

Scene.prototype.load = function(id, callback){
	var _self = this;
	
	database.query('SELECT * FROM scenes WHERE id = ? and active = 1', [id], function(err, rows){
		if(err){
			console.log(err);
			console.log(stack)
			
		}else{
			_self.id = rows[0].id;
			_self.openingLine = rows[0].openingLine;
		}
		
		callback(_self);
	});
	
};

Scene.prototype.getId = function(){ return this.id; };
Scene.prototype.getOpeningLine = function(){ return this.openingLine; };

module.exports = Scene;
