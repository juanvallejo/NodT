#!/bin/env node

/**
 * Response module template. To be used as the parent class of any module that implements responses from the server
 *
 * @author 	juanvallejo
 * @date 	3/9/15
 */

// import library components
var Globals = require('../globals.js');
var Mimes 	= require('../mimes.js');

var Response = function() {

	/**
	 * Monadic function for applying headers to a response
	 *
	 * @return pointer to passed response object with modified headers
	 */
	this.writeHead = function(response, status, headers) {

		// import global default headers
		var responseHeaders = Globals.defaultResponseHeaders;

		// add, or change, any headers passed by the user
		for(var i in headers) {
			responseHeaders[i] = headers[i];
		}

		response.writeHead(status, responseHeaders);
		return response;
	}

	/**
	 * handles headers and responses for requests. Ends the response object.
	 * Base function for all respond methods
	 */
	this.respond = function(response, message, status, headers) {
		this.writeHead(response, status, headers).end(message);
	}

	/**
	 * Assumes request endpoint is to a static file. Looks up file's mime type and generates a response
	 * with correct mime headers. Serves file's contents as response, if file is found, or a 404 text/plain response
	 * otherwise.
	 */
	this.respondWithFile = function(response, pathToFile, fileMimeType) {

		fs.readFile(Globals.rootDirectory + '/' + pathToFile, function(error, data) {

			if(error) {
				console.log('File ' + pathToFile + ' could not be served -> ' + error);
				return this.respond404(response);
			}

			this.respond(response, data, Globals.SERVER_HEAD_OK, {
				'Content-Type' : fileMimeType
			});

		});

	};

	/**
	 * handles a response with headers, message, and status passed. Calls this.respond
	 * as its base function
	 */
	this.respondWithMessageAndHeaders = function(response, message, status, headers) {
		this.respond(response, message, status, headers);
	}

	this.respondWithMessage = function(response, message, status) {
		this.respond(response, message, status, {});
	}

	/**
	 * Send a JSON response to the client with a required custom status
	 */
	this.respondWithJSON = function(response, message, status) {
		this.respond(response, JSON.stringify(message), status, {
			'Content-Type' : 'application/json'
		});
	}

	/**
	 * Response similar to this.respondOK, except it uses 'success' as the end message rather than the server's default OK response.
	 */
	this.respondSuccess = function(response) {
		this.respond(response, 'success', Globals.SERVER_HEAD_OK, {});
	}

	/**
	 * Send a 200 response to the client, using default headers and a custom message
	 */
	this.respondOKWithMessage = function(response, message) {
		this.respond(response, message, Globals.SERVER_HEAD_OK, {});
	}

	/**
	 * Send a 200 response to the client, using default headers and a default response
	 */
	this.respondOk = function(response) {
		this.respondOKWithMessage(response, Globals.SERVER_RES_OK);
	}

	/**
	 * Send a 404 (not found) response to the client, using default headers and a default 'not found' response
	 */
	this.respond404 = function(response) {
		this.respond(response, Globals.SERVER_RES_NOTFOUND, Globals.SERVER_HEAD_NOTFOUND, {});
	}

	/**
	 * Send a 500 (server error) response to the client with default headers and a default 'server error' response
	 */
	this.respond500 = function(response) {
		this.respond(response, Globals.SERVER_RES_ERROR, Globals.SERVER_HEAD_ERROR, {});
	}

}

 // expose our responses object
 module.exports = Response;