require('../init');

var Actor = sequelize.define('actor', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  
  name: Sequelize.STRING,
  
  repository: Sequelize.STRING,
  
  language: Sequelize.STRING,
  
  clone_command: Sequelize.STRING,
  
  install_command: Sequelize.STRING,

  start_command: Sequelize.STRING,

	pid_location: Sequelize.STRING,
  
  rehearsal_uri: Sequelize.STRING,
  
  rehearsal_uri_filter: Sequelize.STRING
  
});

Actor.sync().error(function(err){
  console.log('Unable to sync up to the Actor table!')
});

// See Play and Scene for join information 

module.exports = Actor;
