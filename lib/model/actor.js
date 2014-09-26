require('../init');

var Actor = sequelize.define('actor', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  
	level: Sequelize.INTEGER,
	
  name: Sequelize.STRING,
  
  setName: Sequelize.STRING,
  
  role: Sequelize.STRING,								// The path to the component on the set (e.g. /actor)
	
	hasDependent: Sequelize.STRING,				// Determines whether or not this component will record a call to a dependent
	
	active: Sequelize.BOOLEAN
});

Actor.sync().error(function(err){
  console.log('Unable to sync up to the Actor table!')
});

// See Play and Scene for join information 

module.exports = Actor;
