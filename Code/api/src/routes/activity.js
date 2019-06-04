'use strict';

const Router = require('router');

const Auth = require('../middlewares/auth');
const Activity = require('../models/activity');
const Util = require('../util');

// Merge the params if we are comming from another router
let router = new Router({mergeParams: true});
/**
 * Check if activity belongs to user querying it
 */
function isActivityOwner(req, res, next) {
	if (typeof req.params.activityId === 'undefined') {
		next(new Error('Missing activityId'));
	}
	Activity.get(req.params.activityId).then(activity => {
		if (typeof activity === 'undefined') {
			var error = new Error('Activity does not exist');
			error.code = 'ER_RESSOURCE_AUTHORIZATION';
			return next(error);
		}
		if (typeof activity[0] !== 'undefined' && activity[0].fk_user === req.user.id) {
			return next();
		}
		var error = new Error('Ressource does not belong to user')
		error.code = 'ER_RESSOURCE_AUTHORIZATION';
		next(error);
	});
}

/**
 * Get an activity
 * 
 */
router.get('/:activityId', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	Activity.get(req.params.activityId).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	}).catch(err => {
		next(err);
	});
});

/**
 * Update activity
 */
router.put('/:activityId', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	if (!req.body) {
        next(new Error('Missing request body'));
    }
	Activity.update(req.params.activityId, req.body).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

/**
 *	Get all the position from a given activityId
 */
router.get('/:activityId/position', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	Activity.getPosition({activityId: req.params.activityId}).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

/**
 * Get a single position form a given activityId
 */
router.get('/:activityId/position/:positionId', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	Activity.getPosition(req.params.positionId).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

router.post('/:activityId/position', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	if (!req.body) {
        next(new Error('Missing request body'));
    }
	Activity.addPosition(req.params.activityId, req.body).then(result => {
		res.statusCode = 201;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

router.put('/:activityId/position/:positionId', [Auth.bearerLogin, isActivityOwner], (req, res, next) => {
	if (!req.body) {
        next(new Error('Missing request body'));
    }
	Activity.updatePosition(req.params.positionId, req.body).then(result => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	});
});

router.use(require('../middlewares/error'));

module.exports = (req, res, next) => {
    router(req, res, err => {
        next(err);
    });
};