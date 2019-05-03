'use strict';

const crypto = require('crypto');

var Util = {};

Util.getRandomString = function(size) {
	return crypto.randomBytes(Math.ceil(size/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,size);
}

Util.hash = function(string, salt) {
    if(typeof string === 'undefined') {
        throw new Error('string parameter undefined');
    }
    if(typeof salt === 'undefined') {
        salt = Util.getRandomString(16);
    }
	var hmac = crypto.createHmac('sha256', salt); /** Hashing algorithm sha256 */
	hmac.update(string);
	var hash = hmac.digest('hex');
    return {
        hash: hash,
        salt: salt
    }
}

/*
 * Format the parameters to conform to API standard response
 * 
 * @param  {object} err   error returned to the user
 * @param  {array} data   data returned to the user
 * 
 * @return {string} response body
 */
Util.createResponse = function(response) {
    if(typeof response.data !== 'undefined' && !Array.isArray(response.data)) {
        throw new Error('data parameter can only be undefined or array');
    }
    return JSON.stringify({
        error: response.err,
        data: response.data
    });
}

module.exports = Util;