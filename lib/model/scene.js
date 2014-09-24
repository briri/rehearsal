require('../init');
		
var Actor = require('./actor');
		
var Scene = sequelize.define('scene', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	
	title: Sequelize.STRING,
	
	active: Sequelize.BOOLEAN,
	
	sort_order: Sequelize.INTEGER,
	
	antagonist_question: Sequelize.TEXT,
	
	protagonist_deferral: Sequelize.TEXT,
	
	tritagonist_response: Sequelize.TEXT,
	
	protagonist_answer: Sequelize.TEXT
});

var SceneActors = sequelize.define('scene_actors', {role: Sequelize.STRING});

Actor.hasMany(Scene, {through: SceneActors});
Scene.hasMany(Actor, {through: SceneActors});

Scene.sync().error(function(err){
	console.log('Unable to sync up to the Scene table!');
});

module.exports = Scene;
