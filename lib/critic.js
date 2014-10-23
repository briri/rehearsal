var fs = require('fs');

var Critic = function(play){
	this.play = play;
	this.failures = [];
	this.successes = [];
	this.newLines = [];
}

Critic.prototype.record = function(hash){
	if(hash['type'] == 'recording'){
		this.newLines.push(hash);
		
	}else if(hash['type'] == 'success'){
		this.successes.push(hash);
		
	}else{
		this.newLines.push(hash);
	}
}

Critic.prototype.writeReview = function(callback){
	var today = new Date(),
			file = process.cwd() + '/review-play' + this.play + '_' + today.getYear() + '-' + today.getMonth() + '-' + today.getDay() + '.log';
	
	var review = '',
			completed = 0;
	
	if(_.size(this.newLines) > 0){
		review += '\r\nNEW SCENES\r\n----------------------------------------\r\n'
		_.forEach(this.newLines, function(line){
			review += '.... Scene ' + line['scene'] + ', Actor ' + line['actor'] + ': ' + line['actual'] + '\r\n';
			completed++;
		});
	}
	
	if(_.size(this.failures) > 0){
		review += '\r\nFAILURES\r\n----------------------------------------\r\n'
		_.forEach(this.failures, function(line){
			review += '.... Scene ' + line['scene'] + ', Actor ' + line['actor'] + ': Expected "' + line['expected'] + '" but got "' +
												line['actual'] + '"\r\n';
			completed++;
		});
	}
	
	if(_.size(this.successes) > 0){
		review += '\r\nSUCCESSES\r\n----------------------------------------\r\n'
		_.forEach(this.successes, function(line){
			review += '.... Scene ' + line['scene'] + ', Actor ' + line['actor'] + '\r\n';
			completed++;
		});
	}
	
	var waitForReview = setInterval(function(){
		if(completed >= (_.size(this.failures) + _.size(this.successes) + _.size(this.newLines))){
			clearInterval(waitForReview);
		
		  fs.writeFile(file, review, 'utf8', function(err){
		    if(err){
		    	console.log(err);
					console.log(err.stack);
		    }
				callback("Completed the rehearsal for Play-" + this.play + " check the critic's review at " + file + " for full details!");
		  });
		}
	}, 50);
}

module.exports = Critic;