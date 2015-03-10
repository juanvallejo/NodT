#!/bin/env node

/**
 * Handles database connections
 */

// import mysql library
var mysql = require('mysql');
var Globals = require('./globals.js');

/**
 * define mysql connection object
 */
var Database = {

	// define mysql object properties
	connection 			: 	null,				// holds the connection object to the mysql server or null if not connected
	hasData				:	false,				// flag indicating whether mysql database table contains any data
	isBusy 				: 	false, 				// flag indicating whether a mysql query is currently ongoing
	isConnected			: 	false,				// flag indicating whether a connection to mysql server has been established

};

/**
 * creates and establishes a connection to the mysql server.
 * If a connection already exists, the existing connection is returned, unless connection parameters are passed.
 *
 *
 * @param host 		= {String} specifying mysql server address
 * @param user		= {String} specifying database account username
 * @param password	= {String} specifying database account password
 * @param database 	= {String} specifying the name of database to connect to
**/
Database.connect = function(host, user, password, database) {

	// check to see if previous connection exists, or @params for new connection are passed
	if(!Database.isConnected || (host && user && password)) {

		// create connection blueprint
		Database.connection = mysql.createConnection({

			host: 		host 		|| Globals.MYSQL_DEFAULT_HOST,
			user: 		user 		|| Globals.MYSQL_DEFAULT_USER,
			password: 	password 	|| Globals.MYSQL_DEFAULT_PASS,
			database: 	database 	|| Globals.MYSQL_DEFAULT_DB

		});

		// create connection to server
		Database.connection.connect(function(err) {
			// check to see if connection was successful
			if(err) {
				console.log('Error establishing a connection to the mysql server -> ' + err);

				return;
			}

			console.log('successfully connected to mysql server');
		});

		// tell connection flag that connection was successful
		Database.isConnected = true;

		// if new connection @params are given, or there is no previous connection,
		// create one and return it
		return Database.connection;

	} else {
		return Database.connection;
	}
}

/**
 * deletes entries from table where whereLogic applies
 *
 * @param mysqlTableName  	= {Object}		entry object from local 'database' object
 * @param whereLogic 		= {String} 		containing equality to use to target the selection of a specific row
 * @param callback 			= {Function} 	to call after operation has completed successfully
 *
 * for data protection, if @param whereLogic is 'null', nothing is deleted / returned
**/
Database.deleteFrom = function(mysqlTableName, whereLogic, callback) {

	if(whereLogic) {
		// perform query only if whereLogic has been passed
		Database.connect()
			.query('DELETE FROM ' + mysqlTableName + ' WHERE ' + (whereLogic || '1 = 1'), callback);
	} else {
		// fail and exit function with error
		callback.call(this, 'ERR: (mysqldatabasedeletionerror): no \'WHERE\' condition applies for selected logic.');
	}

}

/**
 * safely closes the mysql connection
**/
Database.end = function() {

	if(Database.isConnected) {

		// reset our flag to indicate no connection exists
		Database.isConnected = false;
		// send close packet to server
		Database.connection.end();

	}

}

/**
 * inserts new entry to mysql database
 *
 * @param mysqlTableName  	= {Object}		entry object from local 'database' object
 * @param databaseColumns 	= {Array} 		containing names of mysql table columns to insert values into
 * @param valuesToAdd		= {Array} 		containing entry values to add
 * @param callback 			= {Function} 	to call after operation has completed successfully
**/
Database.insertInto = function(mysqlTableName, databaseColumns, valuesToAdd, callback) {
	// our values to add have to be in quotes. Add them to each value on the list
	valuesToAdd.forEach(function(value, index) {
		valuesToAdd[index] = '"' + value + '"';
	});

	// join arrays of column names and values to add by commas and add them to our query string
	Database.connect()
		.query('INSERT INTO ' + mysqlTableName + '(' + (databaseColumns.join(',')) + ') VALUES (' + valuesToAdd.join(',') + ')', 
			// call user's callback function
			function(err, result) {
				// get err param if any and pass it to callback before calling
				callback.call(Database, err, result);
			});
}

/**
 * selects entries from table, using passed logic
 *
 * @param mysqlTableName  	= {Object}		entry object from local 'database' object
 * @param databaseColumns 	= {Array} 		containing names of mysql table columns to select
 * @param whereLogic 		= {String} 		containing equality to use to target the selection of a specific row
 * @param callback 			= {Function} 	to call after operation has completed successfully
 *
 * if @param whereLogic is 'null', all rows are selected and returned
**/
Database.selectFrom = function(mysqlTableName, databaseColumns, whereLogic, callback) {

	// perform query
	Database.connect()
		.query('SELECT ' + databaseColumns.join(',') + ' FROM ' + mysqlTableName + ' WHERE ' + (whereLogic || '1 = 1'), callback);

}

/**
 * updates entry in database table, using passed logic
 *
 * @param mysqlTableName  	= {Object}		entry object from local 'database' object
 * @param databaseColumns 	= {Array} 		containing names of mysql table columns to update values
 * @param updatedValues		= {Array} 		containing updated entry values
 * @param whereLogic 		= {String} 		containing equality to use to target the update of a specific row
 * @param callback 			= {Function} 	to call after operation has completed successfully
**/
Database.update = function(mysqlTableName, databaseColumns, updatedValues, whereLogic, callback) {
	// variable containing key value pairs to update from arrays passed
	var keyValuePairs = '';

	// generate and store key-value pairs from our two arrays
	databaseColumns.forEach(function(column, index) {
		// add to our string of pairs
		keyValuePairs += ',' + column + ' = ' + '"' + updatedValues[index] + '"';
	});

	// strip comma from key value pairs string
	keyValuePairs = keyValuePairs.substring(1);

	// join arrays of column names and values to add by commas and add them to our query string
	Database.connect()
		.query('UPDATE ' + mysqlTableName + ' SET ' + keyValuePairs + ' WHERE ' + (whereLogic || '1 = 1'), 
			// call user's callback function
			function(err) {
				// get err param if any and pass it to callback before calling and exit
				return callback.call(Database, err);
			});
}

// expose database object
module.exports = Database;