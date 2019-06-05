'use strict';

/**
 * Return an error if the request doesn't exist
 */
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
