'use strict';

const http = require('http');
const Router = require('router');

const website = require('./website');
const api = require('./api');

var router = new Router();

router.use('/api', api);
router.use('/', website);

var server = http.createServer((req, res) => {
    router(req, res, _next => {
        website(req, res);
    });
});

server.listen(80);