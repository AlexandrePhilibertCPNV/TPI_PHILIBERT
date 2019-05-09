'use strict';

const Router = require('router');
const User = require('../models/user');
const Activity = require('../models/activity');
const Auth = require('../middlewares/auth');
const Util = require('../util');

let router = new Router();

router.get('/', (req, res, next) => {
    User.get().then(result => {
        res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
    }).catch(err => {
        next(err);
    });
});

router.get('/:userId', [Auth.bearerLogin], (req, res, next) => {
    User.get(req.params.userId).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
    }).catch(err => {
        next(err);
    });
});

// Create user
router.post('/', (req, res, next) => {
    if (!req.body) {
        next(new Error('Missing request body'));
	}
    User.create(req.body).then(id => {
		res.statusCode = 201;
		res.setHeader('Content-Type', 'application/json');
		var data = [
			{id: id}
		];
		res.end(Util.createResponse({data: data}));
    }).catch(err => {
        next(err);
    });
});

router.put('/:userId', [Auth.bearerLogin, Auth.isOwner], (req, res, next) => {
	if(!req.body) {
		next(new Error('Missing request body'));
	}
	User.update(req.user.id, req.body).then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: [result]}));
	}).catch(err => {
		next(err);
	});
});

router.delete('/:userId', [Auth.bearerLogin, Auth.isOwner], (req, res, next) => {
	User.delete(req.user.id).then(succeeded => {
		res.setHeader('Content-Type', 'application/json');
		return User.get(req.user.id);
	}).then(result => {
		res.end(Util.createResponse({data: [result]}));
	}).catch(err => {
		next(err);
	});
});

// Create activity
router.post('/:userId/activity', [Auth.bearerLogin], (req, res, next) => {
	if(!req.body || req.body.length === 0) {
		var error = new Error('Missing request body');
		error.code = 'ER_MISSING_BODY';
		next(error);
	}
	var values = req.body;
	values.userId = req.params.userId;
	if(req.files && req.files.gpx) {
		values.gpx = req.files.gpx.path;
	}
	
    Activity.create(values).then(id => {
		res.setHeader('Content-Type', 'application/json');
		var data = [
			{id: id}
		]
		res.end(Util.createResponse({data: data}));
	}).catch(err => {
		next(err);
	});
});

router.get('/:userId/activity', [Auth.bearerLogin], (req, res, next) => {
	Activity.get().then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	}).catch(err => {
		next(err);
	});
});

router.get('/:userId/activity/:activityId', [Auth.bearerLogin], (req, res, next) => {
	Activity.get(req.params.activityId).then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	}).catch(err => {
		next(err);
	});
});

// handle the user part of the request, then calls the token router
// router.use('/:userId/token', (req, res, next) => {
//     next();
// }, require('../routes/token'));

// handle errors that happend in the routes above
router.use(require('../middlewares/error'));

module.exports = (req, res, next) => {
    router(req, res, err => {
        next(err);
    });
};
