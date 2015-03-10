#!/bin/env node

/**
 * Handles socket connections
 */

// import web sockets
var socketio = require('socket.io');

var Sockets = {};

Sockets.listen = function(application) {

	socketio.listen(application).on('connection', function(client) {
		console.log('Nigel\'s client connected');
	});

}

module.exports = Sockets;