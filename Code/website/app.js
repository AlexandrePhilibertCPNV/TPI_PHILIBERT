'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const serveStatic = require('serve-static');
const Router = require('router');

const alias = {
    '/': '/index.html',
    '/login': '/index.html',
    '/admin': '/admin.html',
    '/sports': '/sports.html'
};

let router = new Router();

module.exports = (req, res) => {
	var location = alias[req.url] || req.url;
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
		res.setHeader('Content-Type', mime.getType(alias[req.url] || req.url));
		res.end(data);
	});
};