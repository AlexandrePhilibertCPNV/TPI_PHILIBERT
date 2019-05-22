export default function(activityId) {
    const googleMapSrc = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEyReRC6xYEBR8neHbF91-HPrWcfwPIXU&callback=initMap';

    // Taken from gps-distance node module ----------------------

    var RADIUS = 6371;

    var toRad = function(n) {
    return n * Math.PI / 180;
    };

    var getDistance = function(from, to) {
        var fromLat = from.latitude;
        var fromLon = from.longitude;
        var toLat = to.latitude;
        var toLon = to.longitude;

        var dLat = toRad(toLat - fromLat);
        var dLon = toRad(toLon - fromLon);
        var fromLat = toRad(fromLat);
        var toLat = toRad(toLat);

        var a = Math.pow(Math.sin(dLat / 2), 2) +
                (Math.pow(Math.sin(dLon / 2), 2) * Math.cos(fromLat) * Math.cos(toLat));
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return RADIUS * c;
    };

    var measurePath = function(points) {
    return points.reduce(function(memo, point) {
            var distance = memo.lastPoint === null ? 0 : getDistance(memo.lastPoint, point);
            return { lastPoint: point, distance: distance + memo.distance };
        }, { lastPoint: null, distance: 0 }).distance;
    };

    // -----------------

    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    center.appendChild(container);

    let activityPageContainer = document.createElement('div');
    activityPageContainer.classList.add('activityPageContainer');
    container.appendChild(activityPageContainer);

    var activityTitle = document.createElement('div');
    activityTitle.classList.add('activityTitle');
    activityPageContainer.appendChild(activityTitle)

    var mapElement = document.createElement('div');
    mapElement.classList.add('googleMaps');
    activityPageContainer.appendChild(mapElement);

    let userToken = Util.getCookie('userToken');
    Promise.all([
        Util.createRequest('GET', '/api/activity-type'),
        Util.createRequest('GET', '/api/activity/' + activityId, null, {Authorization: 'Bearer '+ userToken})
    ]).then(values => {
        let activityTypes = values[0];
        let activity = values[1][0];
        let activityStartDate = new Date(activity.start_timestamp);

        for(let type in activityTypes) {
            if(activityTypes[type].id === activity.fk_activityType) {
                activityTitle.innerText = activityTypes[type].name + ', le ' + activityStartDate.toLocaleDateString();
            }
        }
    });

    /**
     * Initialize the map and draws the path
     */
    function createGoogleMap() {
        let map = new google.maps.Map(mapElement, {
            center: new google.maps.LatLng(46.6, 6.8),
            zoom: 10
        });

        let userToken = Util.getCookie('userToken');
        let path = [];
        Util.createRequest('GET', '/api/activity/' + activityId + '/position', null, {Authorization: 'Bearer '+ userToken})
            .then(points => {
                // Center on the start of the path
                if(points[0]) {
                    map.setCenter(new google.maps.LatLng(points[0].latitude, points[0].longitude));
                }
                //create Google Map LatLng format
                points.forEach(point => {
                    path.push(new google.maps.LatLng(point.latitude, point.longitude));
                });
                var activityPath = new google.maps.Polyline({
					path: path,
					strokeColor: "#FF0000",
					strokeOpacity: .7,
					strokeWeight: 1.5
                });
                activityPath.setMap(map);

                
                // TODO : transform this into a function that returns pace/km

                let distance = 0;
                let firstKmIndex = 0;
                for(let i = 0; i < 2000; i++) {
                    if(distance > 1) {
                        firstKmIndex = i;
                        break;
                    }
                    distance += getDistance(points[i], points[i+1]);
                }
                console.log(firstKmIndex);
            });
    }


    let goolgeMapsLoaded = false;
    for(let script of document.scripts) {
        if(script.src === googleMapSrc) {
            goolgeMapsLoaded = true;
        }
    }
    // Do not load the script if it was already loaded
    if(goolgeMapsLoaded) {
        createGoogleMap();
    } else {
        var mapScript = document.createElement('script');
        mapScript.src = googleMapSrc;
        document.body.appendChild(mapScript);
    }

    // window.initMap is the callback called when Google Map script has loaded
    window.initMap = createGoogleMap;

    return center;
}