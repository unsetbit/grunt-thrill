var runner = require('thrill').runner;

module.exports = function(grunt){
	grunt.registerMultiTask('thrill', 'Test front-end code on many browsers', function(){
		var config = this.data,
			done = this.async();
		
		if(config.run){
			config.run = grunt.file.expand(config.run);	
			if(config.run.length === 1) config.run = config.run[0];
		}

		if(typeof config === "string") config = {file: config};

		runner(config, function(passed){
			if(passed instanceof Error){
				grunt.fatal('Test did not pass. An unknown error occurred');
				done(false);
				return;
			}
			
			if(passed){
				done(true);
			} else {
				done(false);
			}
		});
	});
};
