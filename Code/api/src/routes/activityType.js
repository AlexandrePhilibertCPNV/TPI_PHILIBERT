'use strict';

const Router = require('router');

const Auth = require('../middlewares/auth');
const Activity = require('../models/activity');
const Util = require('../util');

var router = new Router();

/**
 * Get all activity Types
 */
router.get('/', (req, res, next) => {
	Activity.getType().then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

/**
 * Get a single activity type by id
 * 
 * @param  {string} activityTypeId id of the activity type we want to get
 */
router.get('/:activityTypeId', (req, res, next) => {
	Activity.getType(req.params.activityTypeId).then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(result));
	});
});

/**
 * Create new activityType
 * User has to be admin to create new activityType
 * 
 * Headers : Authorization -> Bearer token of user
 * 
 * @param  {string} activityId id of the activity we want to updated
 */
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