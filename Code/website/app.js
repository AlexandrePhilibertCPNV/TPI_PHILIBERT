'use strict';

const fs = require('fs');
const url = require('url');
const path = require('path');
const mime = require('mime');
const serveStatic = require('serve-static');
const Router = require('router');

let router = new Router();

module.exports = (req, res) => {
	var location = url.parse(req.url).pathname;
	// get index.html on /
	if(location === '/' || location === '') {
		location = '/index.html';
	}
	var srcPath = path.resolve(__dirname + '/public' + location);
    fs.readFile(srcPath, (err, data) => {
		if(err) {
			res.statusCode = 404;
			fs.readFile(path.resolve(__dirname + '/src/error.html'), (err, data) => {
				if(err) {
					res.end('Server error');
				}
				res.end(data);
			});
			return;
		}
		res.statusCode = 200;
		res.setHeader('Content-Type', mime.getType(location));
		res.end(data);
	});
};