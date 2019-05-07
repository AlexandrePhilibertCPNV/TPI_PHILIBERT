'use strict';

const mysql = require('promise-mysql');
const dbConfig = require('../config/db');
const Util = require('../util');

function _parseBearer (bearer) {
	if(typeof bearer === 'undefined') {
		throw new Error('Missing bearer parameter');
	}
	let token;
	try {
		token = bearer.split('Bearer ').pop();
	} catch(err) {
		throw new InvalidFormatError('Bearer token format invalid');
	}
	return token;
}

var Session = {};

Session.create = (userId) => {
	var date = new Date();
	date.setDate(new Date().getDate() + 5);
	
	var token = Util.getRandomString(32);
	var values = {
		value: token,
		validity_timestamp: date.toISOString(),
		fk_user: userId
	};

	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('INSERT INTO tbl_session SET `id` = UUID(), ?', values);
		conn.end();
		return result;
	}).then(_result => {
		return token;
	});
}

Session.validate = (bearer) => {
	var token = _parseBearer(bearer);
	if(typeof token === 'undefined') {
		throw new Error('Missing token parameter');
	}
	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('SELECT fk_user AS id FROM tbl_session WHERE value=?', [token]);
		conn.end();
		return result;
	}).then(session => {
		if(typeof session === 'undefined' || typeof session[0] === 'undefined') {
			var error = new Error('Token validation failed');
			error.code = 'ER_TOKEN_VALIDATION';
			throw error;
		}
		return session[0];
	});
}

module.exports = Session;