'use strict';

const Router = require('router');
const bodyParser = require('body-parser');

let router = new Router();

// Parse URL encoded body of request expect multipart
router.use(bodyParser.urlencoded({extended: true}));
// Parse JSON body of request
router.use(bodyParser.json({limit: '5mb'}));

// handle errors
// router.use(require('./middlewares/error'));

router.use('/token', require('./routes/token'));
router.use('/user', require('./routes/user'));
router.use('/activity', require('./routes/activity'));
router.use('/activity-type', require('./routes/activityType'));

// this router is called when no routes where taken
router.use(require('./routes/notfound'));

module.exports = router;
