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
    leftPane.appendChild(createRow([nameLabel, name]));
    
    var locationLabel = document.createElement('label');
    locationLabel.innerText = 'Lieu';

    var countries = document.createElement('select');
    Util.createRequest('GET', '/api/country/').then(data => {
        data.forEach(countryData => {
            var country = document.createElement('option');
            country.value = countryData.id;
            country.innerText = countryData.name
            countries.appendChild(country);
        })
    });

    var places = document.createElement('select');
    leftPane.appendChild(createRow([locationLabel, countries, places]));

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
    startLabel.innerText = 'Début';

    var start = document.createElement('input');
    start.type = 'datetime-local';
    rightPane.appendChild(createRow([startLabel, start]));

    var endLabel = document.createElement('label');
    endLabel.innerText = 'Fin';

    var end = document.createElement('input');
    end.type = 'datetime-local';
    rightPane.appendChild(createRow([endLabel, end]));

    var distanceLabel = document.createElement('label');
    distanceLabel.innerText = 'Distance';

    var distance = document.createElement('input');
    distance.type = 'number';

    var km = document.createElement('div');
    km.classList.add('inlineBlock');
    km.innerText = 'km';
    rightPane.appendChild(createRow([distanceLabel, distance]));

    var posHeightDiffLabel = document.createElement('label');
    posHeightDiffLabel.innerText = 'Dénivelé positif';

    var posHeightDiff = document.createElement('input');
    posHeightDiff.type = 'number';
    rightPane.appendChild(createRow([posHeightDiffLabel, posHeightDiff]));

    var negHeightDiffLabel = document.createElement('label');
    negHeightDiffLabel.innerText = 'Dénivelé négatif';

    var negHeightDiff = document.createElement('input');
    negHeightDiff.type = 'number';
    rightPane.appendChild(createRow([negHeightDiffLabel, negHeightDiff]));

    var averageSpeedLabel = document.createElement('label');
    averageSpeedLabel.innerText = 'Vitesse moyenne';

    var averageSpeed = document.createElement('input');
    averageSpeed.type = 'number';
    rightPane.appendChild(createRow([averageSpeedLabel, averageSpeed]));

    var errorContainer = document.createElement('div');
    errorContainer.classList.add('errorContainer');

    var errorMessage = document.createElement('div');
    errorMessage.classList.add('errorMessage');
    errorContainer.appendChild(errorMessage);

    rightPane.appendChild(createRow([errorContainer]));

    var submitButton = document.createElement('button');
    submitButton.innerText = "Créer";
    rightPane.appendChild(createRow([submitButton]));

    submitButton.addEventListener('click', function(evt) {
        evt.preventDefault();

        var body = {};
        for(var elemIndex = 0; elemIndex < activityCreation.elements.length; elemIndex++) {
            if(typeof activityCreation.elements[elemIndex] === 'button') {
                continue;
            }
            body[activityCreation.elements[elemIndex].id] = activityCreation.elements[elemIndex].value;
        }

        var request = new XMLHttpRequest();
        request.open('POST', 'api/user/' + 'c45864c5-3523-4eb5-9c70-198d9cbba346' + '/activity', true);

        request.onload = function() {
			var response = JSON.parse(this.responseText);
            if(response.err) {
                errorMessage.innerText = response.err.message;
            }
        }
        
        request.send(body);
    });

    return center;
}