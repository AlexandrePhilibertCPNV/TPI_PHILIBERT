'use strict';

const mysql = require('promise-mysql');
const gpxParse = require('gpx-parse');
const gpsDistance = require('gps-distance');
const uuidv4 = require('uuid/v4');
const validator = require('validator');

const dbConfig = require('../config/db');
const Util = require('../util');

var Activity = {};

var returnedFields = [
	"tbl_activity.id",
	"fk_activityType",
	"fk_user",
	"tbl_activity.name",
	"start_timestamp",
	"end_timestamp",
	"total_distance_km",
	"total_average_speed",
	"total_positive_height_diff",
	"total_negative_height_diff",
	"tbl_activity.removed",
	"fk_place"
];

var insertFields = [
	"id",
	"fk_activityType",
	"fk_user",
	"fk_place"
];

var allowedInsertion = [
	"id",
	"fk_activityType",
	"fk_user",
	"name",
	"start_timestamp",
	"end_timestamp",
	"total_distance_km",
	"total_average_speed",
	"total_positive_height_diff",
	"total_negative_height_diff",
	"fk_place",
	"gpx"
]


var allowedModifications = [
	'name',
	'start_timestamp',
	'end_timestamp',
	'gpx',
	'total_distance_km',
	'total_average_speed'
];

// gpsDistance array index
const LATITUDE_GPSDISTANCEINDEX = 0;
const LONGITUDE_GPSDISTANCEINDEX = 1;

function _computeTotalDistance(waypoints) {
	let points = [];
	// Convert waypoint format to gpsDistance module
	for(let i = 0; i < waypoints.length; i++) {
		points[i] = [];
		points[i][LATITUDE_GPSDISTANCEINDEX] = waypoints[i].lat;
		points[i][LONGITUDE_GPSDISTANCEINDEX] = waypoints[i].lon;
	}
	return gpsDistance(points);
}

function _parseGpx(path) {
	return new Promise((resolve, reject) => {
		if(typeof path === 'undefined') {
			resolve();
		}
		gpxParse.parseGpxFromFile(path, (err, data) => {
			if(err) {
				let error = new Error('GPX parse error');
				error.code = 'ER_GPX_PARSE';
				return reject(error);
			}
			resolve(data);
		});
	});
}

function _computeGpxFields(gpx) {
	var waypoints = gpx.tracks[0].segments[0];
	var startTimestamp = new Date(waypoints[0].time);
	var endTimestamp = new Date(waypoints[waypoints.length-1].time);
	
	//synchronous operation (_computeTotalDistance) is blocking thread ?
	var totalDistanceKm =  _computeTotalDistance(waypoints);
	var startTimeSeconds = startTimestamp.getTime() / 1000;
	var endTimeSeconds = endTimestamp.getTime() / 1000;
	var deltaTimeSeconds = Math.abs(startTimeSeconds - endTimeSeconds);
	var averageSpeed = totalDistanceKm / (deltaTimeSeconds / 60 / 60);

	var heightDiffs = _getHeightDiff(waypoints);

	return {
		start_timestamp: startTimestamp.toISOString(),
		end_timestamp: endTimestamp.toISOString(),
		total_distance_km: totalDistanceKm,
		total_average_speed: averageSpeed,
		total_positive_height_diff: heightDiffs.positive,
		total_negative_height_diff: heightDiffs.negative
	};
}

function _getHeightDiff(positions) {
	var positiveDiff = 0;
	var negativeDiff = 0;
    for(var point = 0; point < positions.length; point++) {
		if(!positions[point+1] || point == 0) {
			continue;
		}
        if(positions[point+1].elevation > positions[point].elevation) {
            positiveDiff += Math.abs(positions[point].elevation - positions[point+1].elevation);
		}
		if(positions[point+1].elevation < positions[point].elevation) {
            negativeDiff += Math.abs(positions[point].elevation - positions[point+1].elevation);
		}
    }
    return {
		positive: positiveDiff,
		negative: negativeDiff
	};
}

Activity.get = (id) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result;
		if (typeof id !== 'undefined') {
			result = conn.query('SELECT ?? FROM tbl_activity WHERE id=?', [returnedFields ,id]);
		} else {
			// Select activities and return 1 if gpx path is different than null
			result = conn.query('SELECT ??, CASE WHEN gpx IS NULL THEN 0 ELSE 1 END AS has_gpx FROM tbl_activity', [returnedFields]);
		}
		conn.end();
		return result;
	});
}

Activity.create = (params) => {
	params.id = uuidv4()
	var promise = Promise.resolve();
	//overwrite promise if gpx is set
	if(params.gpx) {
		promise = _parseGpx(params.gpx);
	}
	var gpxWaypoints;
	return promise.then(gpx => {
		
		// If gpx was sent
		if(!!gpx) {
			gpxWaypoints = gpx.tracks[0].segments[0];
			var gpxFields = _computeGpxFields(gpx);
			Object.assign(params, gpxFields);
		}
		Util.renameProperties(params, {placeId: 'fk_place', activityTypeId: 'fk_activityType', userId: 'fk_user'});

		//Check if all properties are present
		for(var key of insertFields) {
			if(!params[key]) {
				let err = new Error('Missing property ' + key);
				err.code = "ER_MISSING_PROP";
				throw err;
			}
		}

		// Remove fields that are not allowed to be inserted
		for(var key in params) {
			if(!allowedInsertion.includes(key)) {
				delete params[key];
			}
		}

		// Check timestamp format
		if(params.start_timestamp && !validator.isRFC3339(params.start_timestamp)) {
			throw new Error('start_timestamp format is invalid');
		}
		if(params.start_timestamp && !validator.isRFC3339(params.end_timestamp)) {
			throw new Error('end_timestamp format is invalid');
		}

		return mysql.createConnection(dbConfig).then(conn => {
			return conn.query('INSERT INTO tbl_activity SET ?', [params]);
		});
	}).then(() => {
		if(typeof gpxWaypoints !== 'undefined') {
			return Activity.addPositions(params.id, gpxWaypoints);
		}
		return params.id;
	}).then(() => {
		return params.id;
	}).catch(err => {
		console.error(err);
		if(err.code === 'ER_NO_REFERENCED_ROW_2') {
			var error = new Error('Id matching error');
			error.code = 'ER_ID_MATCHING';
			throw error;			
		}
		throw err;
	});
}

Activity.update = (id, params) => {
	if(typeof params === 'undefined') {
		throw new Error('Missing update parameter');
	}
	// Remove fields that are not allowed to be modified
	for(var key in params) {
		if(!allowedModifications.includes(key)) {
			delete params[key];
		}
	}
	
	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('UPDATE tbl_activity SET ? WHERE id=?', [params, id]);
		conn.end();
		return result;
	}).then(result => {
		return {
			updatedFields: params
		};
	});
}

Activity.createType = (params) => {
	return mysql.createConnection(dbConfig).then(conn => {
		params.id = uuidv4();
		return conn.query('INSERT INTO tbl_activityType SET ?', [params])
	}).then(_result => {
		return params.id;
	});
};

Activity.getType = (id) => {
	return mysql.createConnection(dbConfig).then(conn => {
		if (typeof id !== 'undefined') {
			return conn.query('SELECT * FROM tbl_activityType WHERE id=?', [id]);
		}
		return conn.query('SELECT * FROM tbl_activityType');
	});
}

Activity.addPositon = (activityId, gpxWaypoint) => {
	return mysql.createConnection(dbConfig).then(conn => {
		let values = {
			fk_activity: activityId,
			latitude: gpxWaypoint.lat || gpxWaypoint.latitude,
			longitude: gpxWaypoint.lon || gpxWaypoint.longitude,
			timestamp: gpxWaypoint.time || gpxWaypoint.timestamp,
			altitude: gpxWaypoint.elevation || gpxWaypoint.altitude
		};

		var result = conn.query('INSERT INTO tbl_position SET id=UUID(), ?', [values]);
		conn.end();
		return result;
	});
};

Activity.addPositions = (activityId, gpxWaypoints) => {
	return mysql.createConnection(dbConfig).then(conn => {
		
		let sql = 'INSERT INTO tbl_position (id, fk_activity, latitude, longitude, timestamp, altitude) VALUES ?'
		let values = [];
		for(let i = 0; i < gpxWaypoints.length; i++) {
			values.push([
				uuidv4(),
				activityId,
				gpxWaypoints[i].lat,
				gpxWaypoints[i].lon,
				gpxWaypoints[i].time,
				gpxWaypoints[i].elevation
			]);
		}

		let result = conn.query(sql, [values]);
		conn.end();
		return result;
	});
};

Activity.getPosition = (params) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result;
		if (params.activityId) {
			result = conn.query('SELECT * FROM tbl_position WHERE fk_activity=? ORDER BY timestamp ASC', [params.activityId]);
		} else {
			result = conn.query('SELECT * FROM tbl_position LIMIT 200');
		}
		conn.end();
		return result;
	});
};

Activity.updatePosition = (id, params) => {
	if(typeof params === 'undefined') {
		throw new Error('Missing update parameter');
	}
	return mysql.createConnection(dbConfig).then(conn => {
		var result = conn.query('UPDATE tbl_position SET ? WHERE id=?', [params, id]);
		conn.end();
		return result;
	}).then(result => {
		return {
			updatedFields: params
		};
	});
}

module.exports = Activity;