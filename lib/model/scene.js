require('../init');
		
var Actor = require('./actor');
		
var Scene = sequelize.define('scene', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	
	openingLine: Sequelize.STRING
});

var Lines = sequelize.define('lines', {lineToDependency: Sequelize.STRING,
																			 lineToCaller: Sequelize.STRING});

Actor.hasMany(Scene, {through: Lines});
Scene.hasMany(Actor, {through: Lines});

Scene.sync().error(function(err){
	console.log('Unable to sync up to the Scene table!');
});

module.exports = Scene;
