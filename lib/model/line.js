require('../init');

var Line = function(){
	this.id = undefined;
	this.sceneId = null;
	this.antagonistId = null;
	this.protagonistId = null;
	this.tritagonistId = null;
	
	this.lineFromAntagonist = null;
	this.lineToTritagonist = null;
	this.responseFromTritagonist = null;
	this.responseToAntagonist = null;
}

Line.prototype.load = function(sceneId, antagonistId, protagonistId, tritagonistId, callback){
	var _self = this;
	
	database.query('SELECT * FROM lines WHERE sceneId = ? AND antagonistId = ? AND protagonistId = ? AND tritagonistId = ?', 
												[sceneId, antagonistId, protagonistId, tritagonistId], function(err, rows){
													
		if(_.size(rows) > 0){
			_self.id = rows[0]['id'];
		  _self.sceneId = rows[0].sceneId;
			_self.antagonistId = rows[0].antagonistId;
		  _self.protagonistId = rows[0].protagonistId;
		  _self.tritagonistId = rows[0].tritagonistId;
		
			_self.lineFromAntagonist = rows[0].lineFromAntagonist;
			_self.lineToTritagonist = rows[0].lineToTritagonist;
			_self.responseFromTritagonist = rows[0].responseFromTritagonist;
			_self.responseToAntagonist = rows[0].responseToAntagonist;
			
		}else{
			// Create a new record if one was not found!
			_self.id = null;
			_self.sceneId = sceneId;
			_self.antagonistId = antagonistId;
			_self.protagonistId = protagonistId;
			_self.tritagonistId = tritagonistId;
			
			_self.lineFromAntagonist = null;
			_self.lineToTritagonist = null;
			_self.responseFromTritagonist = null;
			_self.responseToAntagonist = null;
		}
		
		callback(_self);
	});
};

Line.prototype.getId = function(){ return this.id; };

Line.prototype.getScene = function(){ return new Scene(this.sceneId); };
Line.prototype.getProtagonist = function(){ return new Actor(this.protagonistId); };

Line.prototype.getAntagonist = function(){ return new Actor(this.antagonistId); };
Line.prototype.setAntagonist = function(antagonistId){ this.antagonistId = antagonistId; };

Line.prototype.getTritagonist = function(){ return new Actor(this.tritagonistId); };
Line.prototype.setTritagonist = function(tritagonistId){ this.tritagonistId = tritagonistId; };

Line.prototype.getLineFromAntagonist = function(){ return this.lineFromAntagonist; };
Line.prototype.setLineFromAntagonist = function(lineFromAntagonist){ this.lineFromAntagonist = lineFromAntagonist; };
Line.prototype.getLineToTritagonist = function(){ return this.lineToTritagonist; };
Line.prototype.setLineToTritagonist = function(lineToTritagonist){ this.lineToTritagonist = lineToTritagonist; };
Line.prototype.getResponseFromTritagonist = function(){ return this.responseFromTritagonist; };
Line.prototype.setResponseFromTritagonist = function(responseFromTritagonist){ this.responseFromTritagonist = responseFromTritagonist; };
Line.prototype.getResponseToAntagonist = function(){ return this.responseToAntagonist; };
Line.prototype.setResponseToAntagonist = function(responseToAntagonist){ this.responseToAntagonist = responseToAntagonist; };

Line.prototype.save = function(){
	var now = new Date(),
			today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + 
										now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
	
	if(this.id != undefined){
		database.query('UPDATE lines SET lineFromAntagonist = ?, lineToTritagonist = ?, ' +
																			'responseFromTritagonist = ?, responseToAntagonist = ?, updatedAt = ? ' +
											'WHERE id = ?', [this.lineFromAntagonist, this.lineToTritagonist, 
																			 this.responseFromTritagonist, this.responseToAntagonist, today, this.id], function(err, results){
																				 	
 			if(err){
 				database.rollback(function(){
 					console.log(err);
 					console.log(err.stack);
 				});
 			}else{
 				database.commit(function(err){
 					if(err){
 						database.rollback(function(){
 							console.log(err); 
 							console.log(err.stack);
 						});
 					}
 				})
 			}
    });
		
	}else{
		database.query('INSERT INTO lines SET sceneId = ?, antagonistId = ?, protagonistId = ?, tritagonistId = ?, ' +
																				'lineFromAntagonist = ?, lineToTritagonist = ?, responseFromTritagonist = ?, ' +
																				'responseToAntagonist = ?, createdAt = ?, updatedAt = ?',
																				[this.sceneId, this.antagonistId, this.protagonistId, this.tritagonistId,
																				 this.lineFromAntagonist, this.lineToTritagonist, 
																				 this.responseFromTritagonist, this.responseToAntagonist, today, today], function(err, results){
																				 	
			if(err){
				database.rollback(function(){
					console.log(err);
					console.log(err.stack);
				});
			}else{
				database.commit(function(err){
					if(err){
						database.rollback(function(){
							console.log(err); 
							console.log(err.stack);
						});
					}
				})
			}
    });
	}
}

module.exports = Line;
