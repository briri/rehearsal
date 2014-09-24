require('../init');

var Act = require('./act'),
		Actor = require('./actor'),
		Stagehand = require('../stagehand');
		
var Play = sequelize.define('play', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	
	description: Sequelize.STRING,
	
	active: Sequelize.BOOLEAN
	
},{
	tableName: 'plays',

	instanceMethods: {
		rehearse: function(writer, callback){
			console.log('\n.... Rehearsing the play');
			callback();
		},
		
		perform: function(critic, callback){
			console.log('\n.... Perfoming the play');
			callback();
		}
	}
});

Play.sync().error(function(err){
	console.log('Unable to sync up to the Play table!')
});

Play.hasMany(Act, {as: 'Acts'});

// Defined the Cast (The Actors associated with this Play)
Play.hasMany(Actor, {as: 'Cast', through: 'cast'})
Actor.hasMany(Play, {as: 'Plays', through: 'cast'})

module.exports = Play;
