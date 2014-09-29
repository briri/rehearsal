require('../init');
		
var Actor = require('./actor');

var Scene = sequelize.define('scene', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},

	openingLine: Sequelize.STRING,
	
	active: Sequelize.BOOLEAN
	
},{
	
	instanceMethods: {
		rehearse: function(writer, stagehand, callback){
			callback(true);
			
			// Load the Script

			// Prepare the Actors

				// Install the Sets

				// Rehearse the Lines (for each actor starting from the top level and working down)
					// If the dependency call is missing, 

						// If the actor has a has a dependent
							// spin up the current Actor as a MOCK set
							// Make sure the Proxy is running
		
							// call the MOCK service
							// retrieve the call received by the Proxy
							// record the call in the DB
		
							// If the actor's level does NOT have a level below it
								// have the stagehand call the LIVE target and pass it the call captured by the Proxy
								// record the response in the DB
			
							// Then do the response to caller missing section if necessary!
			
					// Else If the response to the caller is missing
						// Spin up a MOCK service for the Actor
						// Make sure the Proxy is running
						// Call the service
						// Record the response (the Proxy should handle the dependency response)

					// Else
						// Spin up the MOCK service
						// Call the service with the opening line
						// Make sure the Proxy is running
						// Make sure the response and dependent calls match the DB
		}
	}
});

var Lines = sequelize.define('lines', {lineToDependency: Sequelize.STRING,
																			 lineToCaller: Sequelize.STRING});

Actor.hasMany(Scene, {through: Lines});
Scene.hasMany(Actor, {through: Lines});

Scene.sync().error(function(err){ console.log('Unable to sync up to the Scene table!'); });

module.exports = Scene;
