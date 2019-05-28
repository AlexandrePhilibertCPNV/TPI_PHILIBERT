'use strict';

const http = require('http');
const Router = require('router');
const cluster = require('cluster');
const os = require('os');

const website = require('./website');
const api = require('./api');

var router = new Router();

router.use('/api', api);
router.use('/', website);

// Get the number of threads available on the server
const cpus = os.cpus().length;
if (cluster.isMaster) {
	console.log('Master ' + process.pid + ' has started');

	// Create new workers for each threads
	for (let i = 0; i < cpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log('worker ' + worker.process.id + ' has died with exit code: ' + code);
	});
} else {
	var server = http.createServer((req, res) => {
		router(req, res, _next => {
			website(req, res);
		});
	});
	server.listen(80);

	console.log('Worker ' + process.pid + ' has started');
}
