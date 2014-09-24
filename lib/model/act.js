require('../init');
		
var Scene = require('./scene');

var Act = sequelize.define('act', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	
	title: Sequelize.STRING,
	
	active: Sequelize.BOOLEAN
});

Act.hasMany(Scene, {as: 'Scenes'});
//Act.hasMany(Actor, {as: 'Actors'});

Act.sync().error(function(err){
	console.log('Unable to sync up to the Play table!');
});

module.exports = Act;
