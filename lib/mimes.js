#!/bin/env node

/**
 * Dictionary of file mime type associations and mime type parser functions.
 *
 * @author 	juanvallejo
 * @date 	3/9/15
 */

// import our request router
var Routers = require('./routers.js');

var Mimes 	= {};

// define common file mime types
var dictionaryOfMimeTypes = {

	'css' 	: 'text/css' 				,
	'html' 	: 'text/html' 				,
	'ico' 	: 'image/x-icon'			,
	'jpg' 	: 'image/jpeg'				,
	'jpeg' 	: 'image/jpeg' 				,
	'js' 	: 'application/javascript' 	,
	'map' 	: 'application/x-navimap'	,
	'pdf' 	: 'application/pdf' 		,
	'png' 	: 'image/png'				,
	'ttf'	: 'application/octet-stream',
	'txt' 	: 'text/plain'				,
	'woff'	: 'application/x-font-woff'

};

/**
 * Checks passed requests for a defined file Mime Type, and returns a correct MIME type to be used on a response header.
 *
 * @return {String} requestMimeType		a file mimetype of current request if defined, or a default .txt mime type 
 * 										if request's mime type is not defined
 */
Mimes.mimeTypeParser = function(request, response) {

	var requestToHandle 		= Routers.requestRouter(request, response);
	var requestMimeType 		= dictionaryOfMimeTypes['txt'];

	if(typeof requestMimeType == 'function') {
		console.log('Warning: Request route for endpoint \'' + '\' is of type Function. Unable to serve static file.');
	}

	// retrieve file extension from current request by grabbing
	// suffix after last period of request string
	var requestFileExtension	= requestToHandle.split('.');
	requestFileExtension 		= requestFileExtension[requestFileExtension.length - 1];
	requestFileExtension 		= requestFileExtension.split('&')[0];

	if(dictionaryOfMimeTypes.hasOwnProperty(requestFileExtension)) {
		requestMimeType = dictionaryOfMimeTypes[requestFileExtension];
	}

	return requestMimeType;
}

module.exports = Mimes;