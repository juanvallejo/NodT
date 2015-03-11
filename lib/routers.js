#!/bin/env node

/**
 * Define application routes and route functions
 */

var Routers = {};

// define common request routes
// if a route has a function as a value, the return value of that function is used
// to call a handler function of the same name
var dictionaryOfRoutes = {

	'/'  			: 'index.html',
	'/test/music'	: function() {
		return 'handleRequestAsMusicStream';
	},
	'/api/message'	: function() {
		return 'handleRequestAsAPIMessageEndpoint';
	}
};

/**
 * Checks all incoming requests to see if routing is applicable to them.
 * Parses font file requests that contain queries in urls
 *
 * @return {String} routedRequest
 */
Routers.requestRouter = function(request, response) {

	var requestURL = request.url;

	// modify font requests that have queries in url
	if(requestURL.match(/\.(woff|ttf)(\?)/gi)) {
		requestURL = requestURL.split('?')[0];
	}

	// return default request by default
	var requestToHandle	= requestURL;
	var routedRequest 	= requestURL;

	if(dictionaryOfRoutes.hasOwnProperty(requestToHandle)) {
		routedRequest = dictionaryOfRoutes[requestToHandle];
	}

	return routedRequest;

}

// expose all application request routers
module.exports = Routers;