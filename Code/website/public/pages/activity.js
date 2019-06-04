import gpsDistance from '../scripts/gpsDistance.js';

export default function(activityId) {
    const googleMapSrc = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEyReRC6xYEBR8neHbF91-HPrWcfwPIXU&callback=initMap';

    // allows to set the interval between which points are used to compute distance
    let pointSpacing = 2;

    /**
     * Compute the average pace by kilometers for a set of GPS coordinates
     * 
     * @param  {object} points GPS point with latitude, longitude and timestamp attributes
     */
    function getTrackPace(points) {
        let currentKmIndex = 0;
        let paceKm = [0];
        let averageKmSpeed = [];
        let startPointIndex = 0;
        for(let pointIndex = 0; pointIndex < points.length - pointSpacing; pointIndex += pointSpacing) {
            if(paceKm[currentKmIndex] >= 1) {
                let kmTime = (new Date(points[pointIndex].timestamp) - new Date(points[startPointIndex].timestamp)) / 1000;
                averageKmSpeed[currentKmIndex] = 1 / (kmTime / 3600);
                currentKmIndex += 1;
                paceKm[currentKmIndex] = 0;
                startPointIndex = pointIndex;
            }
            paceKm[currentKmIndex] += gpsDistance(points[pointIndex], points[pointIndex+pointSpacing]);
        }
        return averageKmSpeed;
    }
   

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

    var statPane = document.createElement('div');
    statPane.classList.add('activityStatPane');
    activityPageContainer.appendChild(statPane);

    var statPaneTitle = document.createElement('div');
    statPaneTitle.classList.add('statPaneTitle');
    statPaneTitle.innerText = 'Statistiques';
    statPane.appendChild(statPaneTitle);
    
    var paceTableTitle = document.createElement('div');
    paceTableTitle.classList.add('activityStatTableTitle');
    paceTableTitle.innerText = 'Moyenne au kilomètre';
    activityPageContainer.appendChild(paceTableTitle);

    var paceTableContainer = document.createElement('div');
    paceTableContainer.classList.add('activityStatTableContainer');
    activityPageContainer.appendChild(paceTableContainer);

    var paceTable = document.createElement('table');
    paceTable.classList.add('activityStatTable');
    paceTableContainer.appendChild(paceTable);

    var paceTableHeaderRow = document.createElement('tr');
    paceTable.appendChild(paceTableHeaderRow);

    var paceTableContentRow = document.createElement('tr');
    paceTable.appendChild(paceTableContentRow);    


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

        let totalDistance = document.createElement('div');
        totalDistance.innerText = 'Distance totale : ' + activity.total_distance_km + ' km';
        statPane.appendChild(totalDistance);

        let startTime = document.createElement('div');
        startTime.innerText = 'Début : le ' + new Date(activity.start_timestamp).toLocaleString();
        statPane.appendChild(startTime);

        let endTime = document.createElement('div');
        endTime.innerText = 'Fin : le ' + new Date(activity.end_timestamp).toLocaleString();
        statPane.appendChild(endTime);

        let averageSpeed = document.createElement('div');
        averageSpeed.innerText = 'Vitesse moyenne : ' + activity.total_average_speed + ' km/h';
        statPane.appendChild(averageSpeed);

        let posHeightDiff = document.createElement('div');
        posHeightDiff.innerText = 'Dénivelé positif : ' + activity.total_positive_height_diff + ' m';
        statPane.appendChild(posHeightDiff);

        let negHeightDiff = document.createElement('div');
        negHeightDiff.innerText = 'Dénivelé négatif : ' + activity.total_negative_height_diff + ' m';
        statPane.appendChild(negHeightDiff);
    });

    /**
     * Initialize the map and draws the path
     */
    function createGoogleMap() {
        let map = new google.maps.Map(mapElement, {
            center: new google.maps.LatLng(46.6, 6.8),
            mapTypeControl: true,
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
                // activityPath.setOptions({strokeColor: 'blue'});
                activityPath.setMap(map);

                let trackPace = getTrackPace(points);
                for(let kmIndex = 0; kmIndex < trackPace.length; kmIndex++) {
                    let th = document.createElement('th');
                    th.innerText = kmIndex + 1 + ' km';
                    let td = document.createElement('td');
                    td.innerText = trackPace[kmIndex].toFixed(2) + ' km/h';
                    paceTableHeaderRow.appendChild(th);
                    paceTableContentRow.appendChild(td);
                }                
            });
    }

    let googleMapsLoaded = false;
    for(let script of document.scripts) {
        if(script.src === googleMapSrc) {
            googleMapsLoaded = true;
        }
    }
    // Do not load the script if it was already loaded
    if(googleMapsLoaded) {
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