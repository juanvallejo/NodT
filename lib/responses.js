#!/bin/env node

/**
 * Response handling module for all responses not pertaining to the public API module. All responses done with this module DO NOT support
 * cross-domain origin requests, and are meant to be used to respond to a client or application using this server on the same computer / network.
 */

// import library components
var fs 					= require('fs');
var Globals 			= require('./globals.js');
var Response 			= require('./prototypes/response.js');

var Responses = new Response();

// All core functions currently defined in prototype
// Responses.prototype = new Response();

// expose our responses object
 module.exports = Responses;