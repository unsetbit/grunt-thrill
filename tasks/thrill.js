var utils = require('../lib/utils.js'),
	thrillModule = require('thrill'),
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
		run = config.file.run,
		verbose = data.verbose === true,
		quiet = data.quiet === true,
		pathMap = config.server || {},
		log = console.log.bind(console),
		debug = utils.noop,
		server;

	if(verbose){
		debug = log;
	}	

	if(quiet){
		log = utils.noop;
	}

	grunt.fatal('Run variable must be defined.');
	
	function serverReady(server){
		var served = server.serveFiles(pathMap, run);
		
		if(runHtml){
			runHtml = runHtml.replace(/(<head.*>)/,'$1' + '<base href="' + served.runUrls + '"></base>');
		}
		
		function onReady(thrill){
			var test = thrill({
				run: runHtml || served.runUrls,
				filter: data.filter,
				timeout: data.timeout,
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
			log: log,
			debug: debug,
			queenHost: data.queenHost,
			queenPort: data.queenPort
		});
	}

	function createServer(){
		server = createHttpServer(serverReady, 
			{
				log: log,
				debug: debug,
				port: data.port,
				host: data.host || getExternalIpAddress()
			}
		);
	}	

	if(typeof run === "string" && !~run.indexOf('.js')){
		fs.readFile(run, function(err, data){
			if(err) throw err;
			runHtml = data.toString();
			createServer();
		});
	} else {
		run = grunt.file.expand(run);
		createServer();
	}
};
