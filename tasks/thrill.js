var utils = require('../lib/utils.js'),
	thrillModule = require('../../thrill'),
	createThrill = thrillModule.thrill,
	createHttpServer = thrillModule.httpServer,
	createReporter = thrillModule.reporter.unifiedDot;

module.exports = function(grunt){
	grunt.registerMultiTask('thrill', 'Test front-end code on many browsers', function(){

		run(grunt, this);
	});
};


var getExternalIpAddress = function(){
	var interfaces = require('os').networkInterfaces();

	var addresses = [];
	utils.each(interfaces, function(interface, name){
		addresses = addresses.concat(
			utils.filter(interface, function(node){ 
				return node.family === "IPv4" && node.internal === false;
			})
		);
	});

	if(addresses.length > 0){
		return addresses[0].address;
	}
};

var run = function(grunt, config){
	var done = config.async(),
		data = config.data,
		scripts = config.file.src,
		server;

	server = createHttpServer(serverReady, 
		{
			log: console.log.bind(this),
			port: data.port,
			host: data.host || getExternalIpAddress()
		}
	);
	function serverReady(server){
		scripts = server.serveFiles(scripts);

		function onReady(thrill){
			var test = thrill({
				scripts: scripts, 
				filter: data.filter,
				timeout: data.timeout,
				filter: data.filter,
				autoStart:false
			});
			
			var reporter = createReporter(test);
			reporter.on('results', function(data){
				thrill.kill();
				server.kill(function(){
					if(test.passed){
						done(true);
					} else {
						grunt.fatal('Test did not pass.');
						done(false);
					}	
				});
			});

			test.start();
		};

		createThrill(onReady, { 
			log: console.log.bind(console),
			queenHost: data.queenHost,
			queenPort: data.queenPort
		});
	}
};
