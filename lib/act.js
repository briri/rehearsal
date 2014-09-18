var Act = function(id, title){
	this.id = id;
	this.title = title;
	
	this.scenes = [];
	this.actors = [];
}

Act.prototype.getId = function(){ return this.id; }
Act.prototype.getTitle = function(){ return this.title; }

Act.prototype.getScenes = function(){ return this.scenes; }
Act.prototype.addScene = function(scene){ this.scenes.push(scene); }
Act.prototype.removeScene = function(scene){ this.scenes.pop(scene); }

Act.prototype.getActors = function(){ return this.actors; }
Act.prototype.addActor = function(actor){ this.actors.push(actor); }
Act.prototype.removeActor = function(actor){ this.actors.pop(actor); }

module.exports = Act;