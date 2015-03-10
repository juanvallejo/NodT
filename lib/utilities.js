#!/bin/env node

/**
 * Define utility functions
 */

var Utilities = {};

/**
 * Return a database-formatted date stamp
 */
Utilities.getISODateStamp = function() {

	// calculate the current time stamp
	var date = new Date();
	return date.toISOString().replace(/T/gi, ' ').split('.')[0];

}

module.exports = Utilities;