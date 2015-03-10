#!/bin/env node

/**
* Provided under the MIT License (c) 2014
* See LICENSE @file for details.
*
* @file index.js
*
* @author juanvallejo
* @date 2/28/15
*
* Server library. Integrates with Red Hat's OPENSHIFT platform.
* Can be used for pretty much any app though.
*
**/

// import http module
var http 			= require('http');

// import custom node libraries
var Globals 		= require('./lib/globals.js');
var Handlers 		= require('./lib/handlers.js');
var Sockets			= require('./lib/sockets.js');

// define root of working directory
Globals.rootDirectory = __dirname;


// initialize application
(function main(application) {

	// define global application server and bind to a specified port
	application = http.createServer(Handlers.mainRequestHandler);
	application.listen(Globals.SERVER_PORT, Globals.SERVER_HOST);

	// initialize socket.io
	Sockets.listen(application);

})(Globals.Application);