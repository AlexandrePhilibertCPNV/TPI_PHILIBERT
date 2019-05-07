'use strict';

const Router = require('router');
const Auth = require('../middlewares/auth');
const Session = require('../models/session');
const Util = require('../util');


// Merge the params if we are comming from another router
let router = new Router({mergeParams: true});

router.post('/', [Auth.basiclogin], (req, res, next) => {
	Session.create(req.user.id).then(token => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({data: [{token: token}]}));
	}).catch(err => {
		next(err);
	});
});

router.use(require('../middlewares/error'));

module.exports = (req, res, next) => {
    router(req, res, err => {
        next(err);
    });
};
