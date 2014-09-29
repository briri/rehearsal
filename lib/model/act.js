require('../init');
		
var Scene = require('./scene');

var Act = sequelize.define('act', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},

	title: Sequelize.STRING,

	active: Sequelize.BOOLEAN
	
}, {
	
	instanceMethods: {
		rehearse: function(writer, stagehand, callback){
			var fatal = false;
			
			var scenes = this.getScenes({ where: {active: true} }).success(function(scenes){
				var completed = 0;
	
				_.forEach(scenes, function(scene){
					completed++;
					
					scene.rehearse(writer, stagehand, function(success){
						if(success){ completed++; }else{ fatal = true; };
					});
				});
				
				var waitForAllScenes = setInterval(function(){
					if(fatal || completed >= _.size(scenes)){
						clearInterval(waitForAllScenes);
						callback(!fatal);
					}
				}, 100);
			});
		}
	}
});

Act.hasMany(Scene, {as: 'Scenes'});

module.exports = Act;