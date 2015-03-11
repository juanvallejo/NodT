#!/bin/env node

 /**
 * Node.js server request handler functions
 *
 * @author 	juanvallejo
 * @date 	3/9/15
 */

// import global variables and other package dependencies
var fs 				= require('fs');
var url 			= require('url');
var https 			= require('https');

var Globals 		= require('./globals.js');
var Routers 		= require('./routers.js');
var Mimes 			= require('./mimes.js');
var API 			= require('./api.js');
var Utilities 		= require('./utilities.js');
var Responses 		= require('./responses.js');
var PublicResponses	= require('./public_responses.js');

var Handlers = {};

/**
 * Returns a constant stream of a sample mp3 file
 */
Handlers.handleRequestAsMusicStream = function(request, response) {

}

/**
 * determine if API message is to be served (GET) or posted (POST)
 */
Handlers.handleRequestAsAPIMessageEndpoint = function(request, response) {

	if(request.method != 'POST') {
		return PublicResponses.respondWithMessage(response, 'Warning: This endpoint requires POST method.', 500);
	}

	var postBody = '';

	// get response body
	request.on('data', function(chunk) {
		postBody += chunk;
	});

	request.on('end', function() {

		var postBodyAsJSON = {};
		var postBodyFragments = postBody.split('&');

		postBodyFragments.forEach(function(bodyFragment) {
			var bodyFragmentPair = bodyFragment.split('=');
			postBodyAsJSON[bodyFragmentPair[0]] = bodyFragmentPair[1];
		});

		// check to see that the correct message parameters were sent and post message to the database
		if(postBodyAsJSON['sender'] && postBodyAsJSON['recipient'] && postBodyAsJSON['message'] && postBodyAsJSON['conversation_id']) {
			API.postMessageToDatabase(postBodyAsJSON['sender'], postBodyAsJSON['recipient'], postBodyAsJSON['message'], Utilities.getISODateStamp(), postBodyAsJSON['conversation_id'], function(err, rows, columns) {
				
				if(err) {
					return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
				}

				API.updateConversationById(postBodyAsJSON['conversation_id'], ['is_read', 'timestamp', 'last_message'], ['1', Utilities.getISODateStamp(), postBodyAsJSON['message']], function(err, rows, columns) {

					if(err) {
						return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
					}

					PublicResponses.respondWithMessage(response, 'success', 200);

				});

			});
		} else {
			PublicResponses.respondWithMessage(response, '', 500);
		}

	});

}

/**
 * POSTs current api request to endpoint uri and returns response to client
 */
Handlers.handleRequestAsAPIPOSTCall = function (request, response) {

	var APIURI 				= request.url.split('/api/post/')[1];
	var URIComponents		= url.parse(APIURI);
	var POSTDataFromClient 	= '';
	var APIResponseData 	= '';

	if(APIURI == '') {
		return Responses.respond500(response);
	}

	// receive data to relay from client
	request.on('data', function(chunk) {
		POSTDataFromClient += chunk;
	});

	request.on('end', function() {

		var APIPostRequest = https.request({

			host 	: URIComponents.host,
			path 	: URIComponents.path,
			href 	: URIComponents.href,
			method 	: 'POST',
			headers : {
				'Content-Type' : request.headers['content-type']
			}

		}, function(APIResponse) {

			APIResponse.on('data', function(chunk) {
				APIResponseData += chunk;
			});

			APIResponse.on('end', function() {

				Responses.respond(response, APIResponseData, Globals.SERVER_HEAD_OK, {
					'Content-Type' : 'text/html',
				});

			});

		}).end(POSTDataFromClient);

	});
}

/**
 * Serves current request as a stream from a file on the server
 */
Handlers.handleRequestAsFileStream = function (request, response) {

	var pathToFile 		= Routers.requestRouter(request, response);
	var fileMimeType 	= Mimes.mimeTypeParser(request, response);

	Responses.respondWithFile(response, pathToFile, fileMimeType);
}

/** 
 * Handle all server requests
 */
Handlers.mainRequestHandler = function(request, response) {

	// assign global definition for current request being handled
	Globals.currentRequest = Routers.requestRouter(request, response);

	if(typeof Globals.currentRequest == 'function') {
		// if request calls an application function, define and call that function
		Handlers[Globals.currentRequest()](request, response);
	} else if(Globals.currentRequest.match(/^\/test(\/)?$/gi)) {
		Responses.respondOK(response);
	} else if(Globals.currentRequest.match(/^\/api\/([a-z0-9\/])+/gi)) {
		API.parseGETRequest(request, response);
	} else {
		Handlers.handleRequestAsFileStream(request, response);
	}
}

// expose our api
module.exports = Handlers;