function _sendResponse(res, err) {
	var response = {
		data: [],
		err: {
			code: err.code,
			message: err.message
		}
	};
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(response));
}

module.exports = (err, req, res, next) => {
	switch(err.code) {
		case 'ER_MISSING_REQ_LOGIN':
		case 'ER_MISSING_BODY':
		case 'ER_MYSQL_QUERY':
		case 'ER_MISSING_PROP':
			// Bad request
			res.statusCode = 400;
			_sendResponse(res, err);
			return;
		case 'ER_NO_REFERENCED_ROW':
			// Bad request but error code not returned 
			res.statusCode = 400;
			let error = new Error('Bad formated request');
			error.code = 'ER_BAD_REQUEST';
			_sendResponse(res, error);
			return;
		case 'ER_EMAIL_REGISTERED':
			 // Conflict
			res.statusCode = 409;
			_sendResponse(res, err);
			return;
		case 'ER_LOGIN_FAILED':
		case 'ER_TOKEN_VALIDATION':
		case 'ER_MISSING_TOKEN':
			// Forbidden
			res.statusCode = 403;
			_sendResponse(res, err);
			return;
		case 'ER_RESSOURCE_AUTHORIZATION':
			res.statusCode = 404;
			_sendResponse(res, {code: 'ER_RES_NOT_FOUND', message: 'Requested ressource was not found'});
			return;
	}

    // handle body-parser errors
    if (err.type === 'entity.parse.failed') {
        res.statusCode = err.statusCode;
        _sendResponse(res, err);
        return;
    }

	console.trace(err);
	res.statusCode = 500;
	err.code = 'ER_INTERNAL_ERROR';
	err.message = 'An error occured while processing the request';
	_sendResponse(res, err);
};
