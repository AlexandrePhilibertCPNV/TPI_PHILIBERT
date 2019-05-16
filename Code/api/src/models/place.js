'use strict';

const mysql = require('promise-mysql');

const dbConfig = require('../config/db');
const Util = require('../util');

var Place = {};

Place.get = ()  => {
    return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('SELECT * FROM tbl_place');
		conn.end();
		return result;
	});
}

module.exports = Place;