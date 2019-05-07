'use strict';

const router = require('./src/router');

module.exports = (req, res) => {
    router(req, res, () => {

    });
}