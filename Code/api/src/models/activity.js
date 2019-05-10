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
	"removed",
	"fk_place",
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
				reject(err);
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
			result = conn.query('SELECT ?? FROM tbl_activity', [returnedFields]);
		}
		conn.end();
		return result;
	});
}

Activity.create = (params) => {
	params.id = uuidv4();
	var promise = Promise.resolve();
	if(params.gpx) {
		promise = _parseGpx(params.gpx);
	}

	var gpxWaypoints;
	return promise.then(gpx => {
		var values = {};
		if(!!gpx) {
			gpxWaypoints = gpx.waypoints;
			var gpxFields = _computeGpxFields(gpx);
			Object.assign(values, gpxFields);
		}
		// Override values found in GPX with values provided by the user
		Object.assign(values, params);
		Util.renameProperties(values, {placeId: 'fk_place', activityTypeId: 'fk_activityType', userId: 'fk_user'})

		// Check timestamp format
		if(values.start_timestamp && !validator.isRFC3339(values.start_timestamp)) {
			throw new Error('start_timestamp format is invalid');
		}
		if(values.start_timestamp && !validator.isRFC3339(values.end_timestamp)) {
			throw new Error('end_timestamp format is invalid');
		}
		
		return mysql.createConnection(dbConfig).then(conn => {
			return conn.query('INSERT INTO tbl_activity SET ?', [values]);
		});
	}).then(() => {
		if(typeof gpxWaypoints !== 'undefined') {
			Activity.addPositions(params.id, gpxWaypoints);
		}
		return params.id;
	}).catch(err => {
		if(err.code === 'ER_NO_REFERENCED_ROW_2') {
			var error = new Error('Id matching error');
			error.code = 'ER_MYSQL_QUERY';
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
		
		var queries = [];
		for(let i = 0; i < gpxWaypoints.length; i++) {
			let values = {
				fk_activity: activityId,
				latitude: gpxWaypoints[i].lat,
				longitude: gpxWaypoints[i].lon,
				timestamp: gpxWaypoints[i].time,
				altitude: gpxWaypoints[i].elevation
			};
			queries[i] = conn.query('INSERT INTO tbl_position SET id=UUID(), ?', [values]);
		}
		
		var results = Promise.all(queries);
		conn.end();
		return results;
	});
};

Activity.getPosition = (id) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result;
		if (typeof id !== 'undefined') {
			result = conn.query('SELECT * FROM tbl_position WHERE id=?', [id]);
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