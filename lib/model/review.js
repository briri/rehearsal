require('../init');
		
var Review = sequelize.define('review', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	review_date: Sequelize.DATE,
	scene_id: Sequelize.INTEGER,
	rating: Sequelize.STRING,
	protagonist_response: Sequelize.TEXT,
	expected_response: Sequelize.TEXT
});

Review.sync().success(function(){
	console.log('The Critics have found their seats.')
}).error(function(err){
	console.log('Unable to sync up to the Review table!')
});

module.exports = Review;