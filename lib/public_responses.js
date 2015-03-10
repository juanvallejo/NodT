#!/bin/env node

/**
 * Response handling object for public api requests. Automatically sets the access-control-allow-origin All methods require a response object to be passed.
 * Warning, only use for public data exposure, access-control allows * domains
 *
 * Used in conjunction with API module
 */

// import library components
var Globals = require('./globals.js');
var Response = require('./prototypes/response.js');

var PublicResponses = new Response();

/**
 * Monadic function for applying headers to a response. Modified to use 
 */
PublicResponses.writeHead = function(response, status, headers) {

	// import global default headers
	var responseHeaders = Globals.defaultPublicResponseHeaders;

	// add, or change, any headers passed by the user
	for(var i in headers) {
		responseHeaders[i] = headers[i];
	}

	response.writeHead(status, responseHeaders);
	return response;
}

 // expose our responses object
 module.exports = PublicResponses;