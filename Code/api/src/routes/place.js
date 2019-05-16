'use strict';

const Router = require('router');

const Place = require('../models/place');
const Util = require('../util');

// Merge the params if we are comming from another router
let router = new Router({mergeParams: true});

router.get('/', (req, res, next) => {
	Place.get().then(result => {
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