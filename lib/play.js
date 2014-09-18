var Play = function(id, description){
	this.id = id;
	this.description = description;
	
	this.acts = [];	
}

Play.prototype.getActs = function(){ return this.acts; }
Play.prototype.addAct = function(act){ this.acts.push(act); }
Play.prototype.removeAct = function(act){ this.acts.pop(act); }

Play.prototype.getId = function(){ return this.id; }
Play.prototype.getDescription = function(){ return this.description; }

module.exports = Play;