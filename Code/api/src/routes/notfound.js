'use strict';

module.exports = (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        data: [],
        err: {
            code: 'ER_RESSOURCE_NOT_FOUND',
            message: 'The requested ressource does not exist'
        }
    }))
};
