export default function() {
    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    center.appendChild(container);

    function createRow(elements) {
        var row = document.createElement('div');
        row.classList.add('formRow');
        elements.forEach(element => {
            row.appendChild(element);
        });
        return row;
    }
   
    var activityCreation = document.createElement('form');
    activityCreation.onsubmit = "#";
    activityCreation.classList.add('activityCreation');
    container.appendChild(activityCreation);

    var leftPane = document.createElement('div');
    leftPane.classList.add('formPane', 'inlineBlock');
    activityCreation.appendChild(leftPane);

    var rightPane = document.createElement('div');
    rightPane.classList.add('formPane', 'inlineBlock');
    activityCreation.appendChild(rightPane);

    var nameLabel = document.createElement('label');
    nameLabel.innerText = 'Nom';
    nameLabel.for = "name";

    var name = document.createElement('input');
    name.id = "name";
    name.type = "text";
    name.required = true;
    leftPane.appendChild(createRow([nameLabel, name]));
    
    var locationLabel = document.createElement('label');
    locationLabel.innerText = 'Lieu';

    var countries = document.createElement('select');
    countries.id = "country";

    // Populate country field with data from API
    Util.createRequest('GET', '/api/country/').then(data => {
        data.forEach(countryData => {
            var country = document.createElement('option');
            country.value = countryData.id;
            country.innerText = countryData.name
            countries.appendChild(country);
        })
    });

    var places = document.createElement('select');
    places.id = "placeId";
    places.classList.add('countryPlacesSelect');
    places.required = true;
    leftPane.appendChild(createRow([locationLabel, countries, places]));

    // Populate place field with data from API
    countries.addEventListener('change', evt => {
        var selectedCountryId = countries.options[countries.selectedIndex].value;
        places.innerHTML = '';
        Util.createRequest('GET', '/api/country/' + selectedCountryId + '/place').then(data => {
            data.forEach(placesData => {
                var place = document.createElement('option');
                place.value = placesData.id;
                place.innerText = placesData.name
                places.appendChild(place);
            })
        });
    });

    var typeLabel = document.createElement('label');
    typeLabel.innerText = 'Type';
    typeLabel.setAttribute('for', 'activityTypeId'); 

    var type = document.createElement('select');
    type.id = 'activityTypeId';
    type.required = true;

    // Populate activityType field with data from API
    Util.createRequest('GET', '/api/activity-type').then(data => {
        data.forEach(typeData => {
            var activityType = document.createElement('option');
            activityType.value = typeData.id;
            activityType.innerText = typeData.name
            type.appendChild(activityType);
        })
    });
    

    leftPane.appendChild(createRow([typeLabel, type]));

    var startLabel = document.createElement('label');
    startLabel.setAttribute('for', 'start_timestamp');
    startLabel.innerText = 'Début';
    
    var start = document.createElement('input');
    start.id = "start_timestamp";
    start.type = 'datetime-local';
    start.required = true;
    rightPane.appendChild(createRow([startLabel, start]));

    var endLabel = document.createElement('label');
    startLabel.setAttribute('for', 'end_timestamp');
    endLabel.innerText = 'Fin';

    var end = document.createElement('input');
    end.id = "end_timestamp";
    end.type = 'datetime-local';
    end.required = true;
    rightPane.appendChild(createRow([endLabel, end]));

    var distanceLabel = document.createElement('label');
    distanceLabel.innerText = 'Distance';

    var distance = document.createElement('input');
    distance.id = "distance";
    distance.type = 'number';
    distance.step = "0.01";
    distance.required = true;
    distance.min = 0;

    rightPane.appendChild(createRow([distanceLabel, distance]));

    var posHeightDiffLabel = document.createElement('label');
    posHeightDiffLabel.innerText = 'Dénivelé positif';

    var posHeightDiff = document.createElement('input');
    posHeightDiff.id = "total_positive_height_diff";
    posHeightDiff.type = 'number';
    posHeightDiff.required = true;
    posHeightDiff.min = 0;
    rightPane.appendChild(createRow([posHeightDiffLabel, posHeightDiff]));

    var negHeightDiffLabel = document.createElement('label');
    negHeightDiffLabel.innerText = 'Dénivelé négatif';

    var negHeightDiff = document.createElement('input');
    negHeightDiff.id = "total_negative_height_diff";
    negHeightDiff.type = 'number';
    negHeightDiff.required = true;
    negHeightDiff.min = 0;
    rightPane.appendChild(createRow([negHeightDiffLabel, negHeightDiff]));

    var averageSpeedLabel = document.createElement('label');
    averageSpeedLabel.innerText = 'Vitesse moyenne';

    var averageSpeed = document.createElement('input');
    averageSpeed.id = "total_average_speed";
    averageSpeed.type = 'number';
    averageSpeed.min = 0;
    averageSpeed.required = true;
    rightPane.appendChild(createRow([averageSpeedLabel, averageSpeed]));

    var errorContainer = document.createElement('div');
    errorContainer.classList.add('errorContainer');

    var errorMessage = document.createElement('div');
    errorMessage.classList.add('errorMessage');
    errorContainer.appendChild(errorMessage);

    rightPane.appendChild(createRow([errorContainer]));

    var submitButton = document.createElement('button');
    submitButton.type = "submit";
    submitButton.innerText = "Créer";
    rightPane.appendChild(createRow([submitButton]));

    activityCreation.addEventListener('submit', function(evt) {
        evt.preventDefault();

            var body = {};
            //Get value from form field
            for(var elemIndex = 0; elemIndex < activityCreation.elements.length; elemIndex++) {
                if(typeof activityCreation.elements[elemIndex] === 'button' || !activityCreation.elements[elemIndex].id) {
                    continue;
                }
                body[activityCreation.elements[elemIndex].id] = activityCreation.elements[elemIndex].value;
            }
    
            var request = new XMLHttpRequest();
            request.open('POST', 'api/user/' + 'c45864c5-3523-4eb5-9c70-198d9cbba346' + '/activity', true);
            request.setRequestHeader('Content-Type', "application/json");
            request.setRequestHeader('Authorization', 'Bearer ' + Util.getCookie("userToken"));
    
            request.onload = function() {
        		var response = JSON.parse(this.responseText);
                if(response.err) {
                    // errorMessage.innerText = response.err.message;
                    errorMessage.innerText = "Une erreur est survenue sur le serveur, veuillez réessayer";
                    return;
                }
                errorMessage.innerText = "";
            }
            
            request.send(JSON.stringify(body));
    })

    return center;
}