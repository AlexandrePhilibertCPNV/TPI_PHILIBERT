'use strict';

const Router = require('router');

const Auth = require('../middlewares/auth');
const Activity = require('../models/activity');

var router = new Router();

router.get('/', (req, res, next) => {
	Activity.getType().then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(result));
	});
});

router.get('/:activityTypeId', (req, res, next) => {
	Activity.getType(req.params.activityTypeId).then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(result));
	});
});

router.post('/', [Auth.bearerLogin], [Auth.isAdmin], (req, res, next) => {
	Activity.createType(req.body).then(id => {
		res.statusCode = 201;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({id: id}));
	});
});

router.use(require('../middlewares/error'));

module.exports = (req, res, next) => {
    router(req, res, err => {
        next(err);
    });
};