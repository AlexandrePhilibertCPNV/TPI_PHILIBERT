'use strict';

const crypto = require('crypto');
const mysql = require('promise-mysql');
const validator = require('validator');
const uuidv4 = require('uuid/v4');

const dbConfig = require('../config/db');
const Util = require('../util');

var User = {};

const allowedModifications = [
	'firstname',
	'lastname',
	'password',
	'phonenumber'
];

const selectedFields = [
	'id',
	'firstname',
	'lastname',
	'email',
	'phonenumber',
	'admin'
];



User.get = (id) => {
    return mysql.createConnection(dbConfig).then(conn => {
        var result;
        if (typeof id !== 'undefined') {
            result = conn.query('SELECT ?? FROM tbl_user WHERE id=?', [selectedFields, id]);
        } else {
            result = conn.query('SELECT ?? FROM tbl_user', [selectedFields]);
        }
        conn.end();
        return result;
    });
};

User.login = (email, password) => {
	var connection;
    return mysql.createConnection(dbConfig).then(conn => {
		connection = conn;
		return connection.query('SELECT password_salt FROM tbl_user WHERE email=?', [email]);
	}).then(result => {
		if (typeof result[0] === 'undefined') {
			var error = new Error('Login failed');
			error.code = 'ER_LOGIN_FAILED';
            throw error;
        }
		var sql = 'SELECT id, admin FROM tbl_user WHERE email=? AND password=?';
        var result = connection.query(sql, [email, Util.hash(password, result[0].password_salt).hash]);
        connection.end();
        return result;
    }).then(result => {
        if (typeof result[0] === 'undefined') {
			var error = new Error('Login failed');
			error.code = 'ER_LOGIN_FAILED';
            throw error;
        }
        return result[0];
    });
};

User.create = (params) => {
	
	params.id = uuidv4();
	var hashResult = Util.hash(params.password);
	params.password_salt = hashResult.salt;
	params.password = hashResult.hash;
	
	if(!validator.isEmail(params.email)) {
		throw new Error('Email format invalid');
	}
	
	if(params.password.length < 8) {
		throw new Error('Password too short');
	}
	
    return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('INSERT INTO tbl_user SET ?', params);
		conn.end();
        return result;
    }).then(result => {
		return params.id;
	}).catch(err => {
		if (err.code === 'ER_DUP_ENTRY') {
			var error = new Error('Email already registered');
			error.code = 'ER_EMAIL_REGISTERED';
			throw error;
		}
		throw err;
	});
};

User.update = (id, params) => {
	if(typeof params === 'undefined') {
		throw new Error('Missing update parameter');
	}
	// Remove fields that are not allowed to be modified
	for(var key in params) {
		if(!allowedModifications.includes(key)) {
			delete params[key];
		}
	}
	
	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('UPDATE tbl_user SET ? WHERE id=?', [params, id]);
		conn.end();
		return result;
	}).then(result => {
		//Do not return password to user
		if(params.password) {
			params.password = true;
		}
		return {
			updatedFields: params
		};
	});
}

User.delete = (id) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('UPDATE tbl_user SET disabled=1 WHERE id=?', [id]);
		conn.end();
		return result;
	}).then(result => {
		if(result.affectedRows === 1) {
			return true;
		}
		return false;
	});
}

module.exports = User;