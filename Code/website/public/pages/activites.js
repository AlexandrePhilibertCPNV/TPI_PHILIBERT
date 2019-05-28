export default function() {
    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    center.appendChild(container);

    // headers of HTML table activies
    const headers = ['Lieu', 'Type', 'Début', 'Fin', 'Distance', 'Vitesse', 'Parcours'];
    // fields we are displaying in HTML table, order matters
    const attributes = ['placeName', 'activityTypeName', 'start_timestamp', 'end_timestamp', 'total_distance_km', 'total_average_speed', 'has_gpx'];

    function createHead(headers) {
        let tr = document.createElement('tr');
        headers.forEach(element => {
            let th = document.createElement('th');
            th.innerText = element;
            tr.appendChild(th);
        });
        return tr;
    }

    function createRow(activity) {
        let tr = document.createElement('tr');
        for(let key of attributes) {
            let td = document.createElement('td');
            switch(key) {
                case 'total_distance_km':
                    td.innerText = activity[key] + ' km';
                    break;
                case 'total_average_speed':
                    td.innerText = activity[key] + ' km/h';
                    break;
                case 'start_timestamp':
                case 'end_timestamp':
                    td.innerText = new Date(activity[key]).toLocaleString();
                    break;
                case 'has_gpx':
                    if(activity[key] === 1) {
                        let link = document.createElement('a');
                        link.href = '#activity/' + activity['id'];
                        let terrainIcon = document.createElement('img');
                        terrainIcon.src = '/img/terrain.svg';
                        link.appendChild(terrainIcon);
                        td.appendChild(link);
                    }
                    break;
                default:
                td.innerText = activity[key];
            }
            tr.appendChild(td);
        }
        return tr;
    }

    var activitiesTable = document.createElement('table');
    activitiesTable.classList.add('activitesTable');
    
    var theads = createHead(headers);
    activitiesTable.appendChild(theads);

    container.appendChild(activitiesTable);

    let userId = Util.getCookie("userId");
    let userToken = Util.getCookie('userToken');

    if(!userToken) {
        window.location.hash = '#notfound';
    }
	
	var types;
	var places;
    // Get activity types and all places before querying user activities for mapping
    Promise.all([
		Util.createRequest('GET', '/api/activity-type'), 
		Util.createRequest('GET', '/api/place')
	]).then(values => {
		types = values[0];
		places = values[1];
		return Util.createRequest('GET', '/api/user/' + userId + '/activity', null, {Authorization: 'Bearer '+ userToken});
	}).then(data => {
		data.forEach(activity => {
            // Adding custom properties to received activity
			for(let type in types) {
				if(types[type].id === activity.fk_activityType) {
					activity.activityTypeName = types[type].name;
				}
			}
			for(let place in places) {
				if(places[place].id === activity.fk_place) {
					activity.placeName = places[place].name;
				}
			}
			let row = createRow(activity);
			activitiesTable.appendChild(row);
		});
	});


    return center;
}