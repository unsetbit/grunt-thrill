var runner = require('thrill').runner;

module.exports = function(grunt){
	grunt.registerMultiTask('thrill', 'Test front-end code on many browsers', function(){
		var config = this.data,
			done = this.async();
		if(typeof config.run !== "string"){
			 config.run = grunt.file.expand(run);
		}

		runner(config, function(test){
			if(test.passed){
				done(true);
			} else {
				grunt.fatal('Test did not pass.');
				done(false);
			}
		});
	});
};
