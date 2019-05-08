'use strict';

const mysql = require('promise-mysql');
const gpxParse = require('gpx-parse');
const gpsDistance = require('gps-distance');
const uuidv4 = require('uuid/v4');
const validator = require('validator');

const dbConfig = require('../config/db');

var Activity = {};

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

function _parseGpx(gpx) {
	return new Promise((resolve, reject) => {
		gpxParse.parseGpx(gpx, (err, data) => {
			if(err) {
				reject(err);
			}
			resolve(data);
		});
	});
}

Activity.get = (id) => {
	return mysql.createConnection(dbConfig).then(conn => {
		var result;
		if (typeof id !== 'undefined') {
			result = conn.query('SELECT * FROM tbl_activity WHERE id=?', [id]);
		} else {
			result = conn.query('SELECT * FROM tbl_activity LIMIT 20');
		}
		conn.end();
		return result;
	});
}

Activity.create = (params) => {
	params.id = uuidv4();
	var waypoints;
	return _parseGpx(params.gpx).then(gpx => {
		waypoints = gpx.tracks[0].segments[0];
		var startTimestamp = new Date(waypoints[0].time);
		var endTimestamp = new Date(waypoints[waypoints.length-1].time);
		
		//synchronous operation (_computeTotalDistance) is blocking thread
		var totalDistanceKm =  _computeTotalDistance(waypoints);
		var startTimeSeconds = startTimestamp.getTime() / 1000;
		var endTimeSeconds = endTimestamp.getTime() / 1000;
		var deltaTimeSeconds = Math.abs(startTimeSeconds - endTimeSeconds);
		var averageSpeed = totalDistanceKm / (deltaTimeSeconds / 60 / 60);

		let values = {
			id: params.id,
			name: params.name,
			start_timestamp: startTimestamp,
			end_timestamp: endTimestamp,
			total_distance_km: totalDistanceKm,
			total_average_speed: averageSpeed,
			fk_user: params.userId,
			fk_activityType: params.activityTypeId,
			fk_place: params.placeId,
			gpx: params.gpx
		};
		
		// Check timestamp format
		if(params.start_timestamp && !validator.isRFC3339(params.start_timestamp)) {
			throw new Error('start_timestamp format is invalid');
		}
		if(params.start_timestamp && !validator.isRFC3339(params.end_timestamp)) {
			throw new Error('end_timestamp format is invalid');
		}
		
		return mysql.createConnection(dbConfig).then(conn => {
			return conn.query('INSERT INTO tbl_activity SET ?', [values]);
		});
	}).then(_result => {
		Activity.addPositions(params.id, waypoints);
		return params.id;
	}).catch(err => {
		if(err.code === 'ER_NO_REFERENCED_ROW_2') {
			var error = new Error('Id matching error');
			error.code = 'ER_MYSQL_QUERY';
			throw error;			
		}
		throw err;
	});
};

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
			longitude: gpxWaypoint.lon || gpxWaypoint.timestamp,
			timestamp: gpxWaypoint.time || gpxWaypoint.timestamp,
			altitude: gpxWaypoint.elevation || gpxWaypoint.timestamp
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