var express = require('express');

var role = express.Router();

// ----------------------------------------------------------------------------------------
role.post('/sfx', function(request, response, next){
	var caller = request.headers['host'].toUpperCase();
	
  console.log('........ ' + caller + ' from afar: ' + JSON.stringify(request.body));
	
	var hash = {time: "2014-09-18 09:09:39 -0700",
							id: "fbd70373-1be1-4bbb-870b-084d9fbdf737",
							citations: [{resources:[{source: "Synergy Blackwell Premium",
																			 target: "http://onlinelibrary.wiley.com/doi/10.1046/j.1526-100x.2000.80033.x/abstract",
																			 local_id: "1000000000001716",
																			 format: "electronic",
																			 description: "",
																			 charset: "",
																			 availability: true,
																			 extras: {}},
																			{source: "EBSCOhost Academic Search Complete",
																			 target: "http://openurl.ebscohost.com/linksvc/linking.aspx?sid=a9h&volume=8&date=2000-09&spage=219&issn=1061-2971&stitle=&genre=article&issue=3&title=Restoration+ecology&epage=229",
																			 local_id: "1000000000002159",
																			 format: "electronic",
																			 description: "",
																			 charset: "iso-8859-1",
																			 availability: true,
																			 extras:{}}]}]};
	
	response.setHeader('Content-Type', 'application/json');
  response.writeHead(200);
	
	console.log('........ SFX to ' + caller + ': ' + JSON.stringify(hash));
	
  response.end(JSON.stringify(hash));    
});

module.exports = role;