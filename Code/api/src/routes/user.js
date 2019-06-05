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

/**
 * Create new user
 * 
 * Body : {
 * 	@param {string} email, valid email (see https://www.npmjs.com/package/validator)
 *  @param {string} password, min size 8 characters
 * 	@param {string} firstname, 
 * 	@param {string} lastname,
 * 	@param {string} phonenumber
 * }
 * 
 */
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

/**
 * Update a user
 * 
 * Body : { following fields can be updated
 *  @param {string} password,
 * 	@param {string} firstname, 
 * 	@param {string} lastname,
 * 	@param {string} phonenumber
 * }
 * 
 * @param  {string} userId id of the user we want to update
 */
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

/**
 * Delete a user (will stay in database)
 * User can only delete his own account
 * 
 * @param  {string} userId id of the user we want to update
 */
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


/**
 * Create a new activity
 * 
 * Body can either be one of the following : 
 * 
 * Body : { Content-Type application/json
 *  @param {string} activityTypeId,
 * 	@param {string} placeId, 
 * 	@param {string} start_timestamp,
 * 	@param {string} end_timestamp,
 * 	@param {string} total_average_speed,
 * 	@param {string} total_distance_km,
 * 	@param {string} gpx,	/!\ large file can lead to increased sending time of request
 * }
 * 
 * 
 * In the example below the values from start_timestamp, end_timestamp,
 * total_average_speed, total_distance_km are overwritten by values from the GPX file
 * 
 * Body : { Content-Type multipart/form-data max size 20Mb
 *  @param {string} activityTypeId,
 * 	@param {string} placeId,
 * 	@param {string} start_timestamp,optional
 * 	@param {string} end_timestamp,optional
 * 	@param {string} total_average_speed,optional
 * 	@param {string} total_distance_km,optional
 * 	@param {string} gpx, 
 * }
 * 
 * Headers : Authorization -> Bearer token of user
 * 
 * @param  {string} userId id of the user that wants to insert a new activity
 * 
 * Response of this query is returned when all positions where inserted in database,
 * this could take some time.
 */
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

/**
 * Get activites from a user
 * 
 * Headers : Authorization -> Bearer token of user
 * 
 * @param  {string} userId id of the user that wants to retreive its activities
 */
router.get('/:userId/activity', [Auth.bearerLogin], (req, res, next) => {
	Activity.get().then(result => {
		res.setHeader('Content-Type', 'application/json');
		res.end(Util.createResponse({data: result}));
	}).catch(err => {
		next(err);
	});
});

/**
 * Get single activity from a user
 * 
 * Headers : Authorization -> Bearer token of user
 * 
 * @param  {string} userId id of the user that wants to retreive his activity
*  @param  {string} activityId id of the activity the user wants to retreive
 */
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
