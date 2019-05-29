export default function() {
    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    center.appendChild(container);

    function createCardRow(title, value) {
        let cardRow = document.createElement('div');
        cardRow.classList.add('cardRow');

        // if not element, treat it as text
        if(typeof title !== 'object') {
            let cardRowTitle = document.createElement('div');
            cardRowTitle.classList.add('cardRowTitle');
            cardRowTitle.innerText = title;
            cardRow.appendChild(cardRowTitle);
        }
        
        let cardRowValue = document.createElement('div');
        cardRowValue.classList.add('cardRowValue');
        cardRow.appendChild(cardRowValue);

        if(typeof value !== 'undefined') {
            cardRowValue.innerText = value;
        }
        if(typeof title === 'object') {
            cardRowValue.classList.add('cardRowCentered');
            cardRowValue.appendChild(title);
        }

        return cardRow;
    }

    function createCard(activity, link) {
        let container;
        if(typeof link !== 'undefined') {
            container = document.createElement('a');
            container.href = link;
            container.draggable = false;
            container.classList.add('activityCardClickable');
        } else {
            container = document.createElement('div');;
        }
        container.classList.add('activityCard');

        var titleRow = document.createElement('div');
        titleRow.classList.add('cardRow');
        titleRow.classList.add('cardRowHeader');
        titleRow.innerText = activity.activityTypeName;
        container.appendChild(titleRow);

        let startDate = new Date(activity.start_timestamp);
        let endDate = new Date(activity.end_timestamp);
        container.appendChild(createCardRow('Début', startDate.toLocaleDateString()));

        container.appendChild(createCardRow('Lieu', activity.placeName));

        let duration = new Date(endDate - startDate);
        let durationMinutes = '00' + duration.getMinutes();
        let durationHours = '00' + duration.getHours();
        let durationString = durationHours.substring(durationHours.length - 2)+ 'h' + durationMinutes.substring(durationMinutes.length -2) + 'm'
        container.appendChild(createCardRow('Durée', durationString));
        container.appendChild(createCardRow('Distance', activity.total_distance_km + ' km'));
        container.appendChild(createCardRow('Vitesse', activity.total_average_speed + ' km/h'));

        if(activity.has_gpx === 1) {
            let link = document.createElement('a');
            link.href = '#activity/' + activity['id'];
            let terrainIcon = document.createElement('img');
            terrainIcon.src = '/img/terrain.svg';
            link.appendChild(terrainIcon);
            container.appendChild(createCardRow(link))
        }
        return container;
    }

    var activitiesContainer = document.createElement('div');
    activitiesContainer.classList.add('activitiesContainer');
    container.appendChild(activitiesContainer);

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
            let card;
            if(activity.has_gpx === 1) {
                card = createCard(activity, '#activity/' + activity['id']);
            } else {
                card = createCard(activity);
            }
            activitiesContainer.appendChild(card);
		});
	});


    return center;
}