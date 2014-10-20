require('../init');

var Line = function(params){
	if(params == undefined) params = {};
	
	this.id = params['id'] || undefined;
	this.sceneId = params['sceneId'] || undefined;
	this.actorId = params['actorId'] || undefined;
	this.lineIn = params['lineIn'] || undefined;
	this.lineOut = params['lineOut'] || undefined;
}

// -----------------------------------------------------------------------------------------------
Line.prototype.load = function(id, callback){
	var _self = this;
	
	database.query('SELECT * FROM script WHERE id = ?', [id], function(err, rows){
		if(err){
			console.log(err);
			console.log(stack)
			
		}else{
			_self.id = rows[0].id;
			_self.sceneId = rows[0].sceneId;
			_self.actorId = rows[0].actorId;
			_self.lineIn = rows[0].lineIn;
			_self.lineOut = rows[0].lineOut;
		}
		
		callback(_self);
	});
	
};

// -----------------------------------------------------------------------------------------------
Line.prototype.getId = function(){ return this.id; };
Line.prototype.getSceneId = function(){ return this.sceneId; };
Line.prototype.getActorId = function(){ return this.actorId; };

// -----------------------------------------------------------------------------------------------
Line.prototype.getLineIn = function(){ return this.lineIn; };
Line.prototype.setLineIn = function(line){ this.lineIn = line; };
Line.prototype.getLineOut = function(){ return this.lineOut; };
Line.prototype.setLineOut = function(line){ this.lineOut = line; };

// -----------------------------------------------------------------------------------------------
Line.prototype.equals = function(line){
	return (line.getSceneId() == this.getSceneId() && line.getActorId() == this.getActorId() && line.getLineIn() == this.getLineIn());
}

// -----------------------------------------------------------------------------------------------
Line.prototype.save = function(callback){
	var _self = this,
			now = new Date();
			today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + 
									now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

	if(this.id != undefined){
		database.query('UPDATE script SET lineOut = ?, updatedAt = ? WHERE id = ?', [this.lineOut, today, this.id], function(err, results){
			if(err){
				database.rollback(function(){
					console.log(err);
					console.log(err.stack);
						
					callback(false);
				});
					
			}else{
				database.commit(function(err){
					if(err){
						console.log('Commit: ' + err);
						console.log(err.stack);
						
						callback(false);
					}else{
						callback(true);
					}
				});
			}
		});
			
	}else{
		database.query('INSERT INTO script (sceneId, actorId, lineIn, lineOut, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
											[this.sceneId, this.actorId, this.lineIn, this.lineOut, today, today], function(err, results){

			if(err){
				database.rollback(function(){
					console.log(err);
					console.log(err.stack);
						
					callback(false);
				});
					
			}else{
				database.commit(function(err){
					if(err){
						console.log('Commit: ' + err);
						console.log(err.stack);
						
						callback(false);
					}else{
						callback(true);
					}
				});
			}
		});
	}
}

module.exports = Line;
