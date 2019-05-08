const mysql = require('promise-mysql');

const dbConfig = require('../config/db');

var Country = {};

Country.get = (countryId) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result;
		if (typeof countryId !== 'undefined') {
			result = conn.query('SELECT * FROM tbl_country WHERE id=?', [countryId]);
		} else {
			result = conn.query('SELECT * FROM tbl_country');
		}
		conn.end();
		return result;
	});
}

Country.getPlace = (countryId) => {
	return mysql.createConnection(dbConfig).then(conn => {
		if(typeof countryId === 'undefined') {
			throw new Error('parameter countryId is undefined');
		}
		var result;
		result = conn.query('SELECT id, name FROM tbl_place WHERE id=?', [countryId]);
		conn.end();
		return result;
	});
}

module.exports = Country;