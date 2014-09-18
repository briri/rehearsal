var _ = require('underscore'),
		Play = require('./play'),
		Act = require('./act'),
		Scene = require('./scene'),
		Actor = require('./actor');

var Writer = function(){
	var mysql = require('mysql');
	
	this.conn = mysql.createConnection({host: 'localhost',
																		 user: 'root',
																	   password: '',
																	   database: 'rehearsal'});
																	 
	this.conn.connect();

	this.plays = []
	
	var _this = this;

	this.conn.query('SELECT id, description FROM plays where active = 1', function(err, rows, fields){
		if(err) throw err;
	
		_.forEach(rows, function(row){
			
			var play = new Play(row.id, row.description);
			
			_this.conn.query('SELECT id, title FROM acts WHERE play_id = ' + play.getId(), function(err, rows, fields){
				if(err) throw err;
				
				_.forEach(rows, function(row){
					var act = new Act(row.id, row.title);
					
					_this.conn.query('SELECT scenes.id AS scene_id, ' +
																	'ant.id AS ant_id, ant.name AS ant_name, ant.repository AS ant_repo, ant.configurations AS ant_config, ' +
																	'prot.id AS prot_id, prot.name AS prot_name, prot.repository AS prot_repo, prot.configurations AS prot_config, ' +
																	'tri.id AS tri_id, tri.name AS tri_name, tri.repository AS tri_repo, tri.configurations AS tri_config, ' +
																	'antagonist_line, protagonist_line, protagonist_response, tritagonist_response ' +
														'FROM scenes ' +
															'INNER JOIN actors AS ant ON scenes.antagonist = ant.id ' +
															'INNER JOIN actors AS prot ON scenes.protagonist = prot.id ' +
															'INNER JOIN actors AS tri ON scenes.tritagonist = tri.id ' +
															'WHERE scenes.act_id = ' + act.getId() + ' ORDER BY scenes.sort_order', function(err, rows, fields){

						if(err) console.log(err);

						if(rows.length > 0){
							_.forEach(rows, function(row){
								var antagonist = new Actor(row.ant_id, row.ant_name, row.ant_repo, row.ant_config, row.antagonist_line, null);
								var protagonist = new Actor(row.prot_id, row.prot_name, row.prot_repo, row.prot_config, row.protagonist_line, row.protagonist_response);
								var tritagonist = new Actor(row.tri_id, row.tri_name, row.tri_repo, row.tri_config, null, row.tritagonist_response);
						
								var scene = new Scene(row.scene_id, antagonist, protagonist, tritagonist);
						
								act.addScene(scene);
							});
						}
					});
					
					play.addAct(act);
				});
			});
			
			_this.plays.push(play);	
		});
		
	});
};

Writer.prototype.getPlays = function(){ return this.plays; }
Writer.prototype.retire = function(){ return this.conn.end(); }

module.exports = Writer;
