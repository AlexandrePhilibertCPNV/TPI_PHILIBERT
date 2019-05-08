'use strict';

const Router = require('router');
const url = require('url');


const Country = require('../models/country');

var router = new Router();

router.get('/', (req, res, next) => {
    Country.get().then(result => {
        res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({data: result}));
    });
});

router.get('/:countryId/place', (req, res, next) => {
    Country.getPlace(req.params.countryId).then(result => {
        res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({data: result}));
    });
});

router.use(require('../middlewares/error'));

module.exports = (req, res, next) => {
    router(req, res, err => {
        next(err);
    });
};
