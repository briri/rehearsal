require('../init');

var Actor = require('./actor'),
		Stagehand = require('../stagehand'),
		Act = require('./act');

var Play = sequelize.define('play', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	
	description: Sequelize.STRING,
	
	active: Sequelize.BOOLEAN
	
},{
	tableName: 'plays',

	instanceMethods: {
		rehearse: function(writer, stagehand, callback){
			console.log('\n.... Rehearsing Play: ' + this.description);
			
			var acts = this.getActs({ where: {active: true} }).success(function(acts){
				var finished = 0,
						fatal = false;
						
				_.forEach(acts, function(act){
					console.log('\n.... Act: ' + act.title);
		
					act.rehearse(writer, stagehand, function(success){
						if(success){ finished++; }else{ fatal = true; };
					});
				});
	
				var waitForAllActs = setInterval(function(){
					if(fatal || finished >= _.size(acts)){
						clearInterval(waitForAllActs);
						callback(!fatal);
					}
				}, 100);
			});
			
		}
	}
});

Play.hasMany(Act, {as: 'Acts'});

// ------------------------------------------------------------------------------------
Play.sync().error(function(err){ console.log('Unable to sync up to the Play table!') });

module.exports = Play;
