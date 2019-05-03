'use strict';

const User = require('../models/user');
const Session = require('../models/session');

var Auth = {};

Auth.basiclogin = (req, res, next) => {
    if (!req.body || !req.body.email || !req.body.password) {
        var error = new Error('Request body does not contain login informations');
        error.code = 'ER_MISSING_REQ_LOGIN';
        return next(error);
    }
    User.login(req.body.email, req.body.password).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        next(err);
    });
};

Auth.bearerLogin = (req, res, next) => {
	if (!req.headers['authorization']) {
		var error = new Error('Missing bearer authorization header');
		error.code = 'ER_MISSING_TOKEN';
		return next(error);
	}
	Session.validate(req.headers['authorization']).then(user => {
		req.user = user;
		next();
	}).catch(err => {
		next(err);
	});
}

Auth.isOwner = (req, res, next) => {
    if (!req.params.userId || !req.user.id) {
        return next(new Error('Missing request elements'));
    }
    if (!req.params.userId === req.user.id) {
        return next(new Error('User is not owner of this ressource'));
    }
    next();
};

Auth.isAdmin = (req, res, next) => {
    if(req.user === 'undefined') {
        return next(new Error('user attribute is undefined'));
    }
    User.get(req.user.id).then(result => {
        if(typeof result[0] === 'undefined') {
            return next(new Error('User was not found in database'));
        }
        if(result[0].admin === 1) {
            return next();
        }
        return next(new Error('The user trying to access this ressource is not an admin'));
    }).catch(err => {
        next(err);
    })
}

module.exports = Auth;
