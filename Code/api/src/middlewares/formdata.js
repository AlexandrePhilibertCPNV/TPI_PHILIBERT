const formidable = require('formidable');
const fs = require('fs');

const gpxPath = '/var/runscape/gpx/';

// Parse multipart/form-data up to 20Mb (default size)
module.exports = (req, res, next) => {
    // Call next if there is no multipart data
    if(req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') === -1) {
        return next();
    }
    var form = new formidable.IncomingForm();
    //create path if it doesn't exist
    fs.mkdirSync(gpxPath, { recursive: true });
    form.uploadDir = gpxPath;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return next(err);
        }
        // Add parsed fileds to req.body
        Object.assign(req.body, fields);
        req.files = files;
        next();
    });
};