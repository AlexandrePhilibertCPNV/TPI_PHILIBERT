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

    
    /**
     * @param  {string} selectedCountryId the country from which we want to select its places
     * @param  {object} targetElem  the target HTML select element we want to append the result to
     */
    function queryPlaces(selectedCountryId, targetElem) {
        Util.createRequest('GET', '/api/country/' + selectedCountryId + '/place').then(data => {
            data.forEach(placesData => {
                var place = document.createElement('option');
                place.value = placesData.id;
                place.innerText = placesData.name
                targetElem.appendChild(place);
            })
        });
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
        });
        var selectedCountryId = countries.options[countries.selectedIndex].value;
        queryPlaces(selectedCountryId, places)
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
        queryPlaces(selectedCountryId, places)
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

    var gpxFileLabel = document.createElement('label');
    gpxFileLabel.setAttribute('for', 'gpx');
    gpxFileLabel.innerText = 'GPX';

    var gpxFile = document.createElement('input');
    gpxFile.id = 'gpx';
    gpxFile.type = 'file';

    gpxFile.addEventListener('change', function(evt) {
        if(gpxFile.files.length > 0) {
            infoMessage.innerText = 'Les champs de la colonne de droite ne sont plus requis';
            [start, end, distance, posHeightDiff, negHeightDiff].forEach(elem => {
                elem.required = false;
            });
            return;
        }
        infoMessage.innerText = '';
        [start, end, distance, posHeightDiff, negHeightDiff].forEach(elem => {
            elem.required = true;
        });
    });

    leftPane.appendChild(createRow([gpxFileLabel, gpxFile]));

    var infoContainer = document.createElement('div');
    infoContainer.classList.add('infoContainer');

    var infoMessage = document.createElement('div');
    infoMessage.classList.add('infoMessage');
    infoContainer.appendChild(infoMessage);

    leftPane.appendChild(createRow([infoContainer]));
    

    var startLabel = document.createElement('label');
    startLabel.setAttribute('for', 'start_timestamp');
    startLabel.innerText = 'Début';
    
    var start = document.createElement('input');
    start.id = "start_timestamp";
    start.type = 'datetime-local';
    start.required = true;
    rightPane.appendChild(createRow([startLabel, start]));

    var endLabel = document.createElement('label');
    endLabel.setAttribute('for', 'end_timestamp');
    endLabel.innerText = 'Fin';

    var end = document.createElement('input');
    end.id = "end_timestamp";
    end.type = 'datetime-local';
    end.required = true;
    rightPane.appendChild(createRow([endLabel, end]));

    var distanceLabel = document.createElement('label');
    distanceLabel.setAttribute('for', 'distance');
    distanceLabel.innerText = 'Distance (km)';

    var distance = document.createElement('input');
    distance.id = "distance";
    distance.type = 'number';
    distance.step = "0.01";
    distance.required = true;
    distance.min = 0;

    rightPane.appendChild(createRow([distanceLabel, distance]));

    var posHeightDiffLabel = document.createElement('label');
    posHeightDiffLabel.setAttribute('for', 'total_positive_height_diff');
    posHeightDiffLabel.innerText = 'Dénivelé positif (m)';

    var posHeightDiff = document.createElement('input');
    posHeightDiff.id = "total_positive_height_diff";
    posHeightDiff.type = 'number';
    posHeightDiff.required = true;
    posHeightDiff.min = 0;

    rightPane.appendChild(createRow([posHeightDiffLabel, posHeightDiff]));

    var negHeightDiffLabel = document.createElement('label');
    negHeightDiffLabel.setAttribute('for', 'total_negative_height_diff');
    negHeightDiffLabel.innerText = 'Dénivelé négatif (m)';

    var negHeightDiff = document.createElement('input');
    negHeightDiff.id = "total_negative_height_diff";
    negHeightDiff.type = 'number';
    negHeightDiff.required = true;
    negHeightDiff.min = 0;

    rightPane.appendChild(createRow([negHeightDiffLabel, negHeightDiff]));

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

    function getFormElementsValue(form) {
        var values = {};
        for(var elemIndex = 0; elemIndex < form.elements.length; elemIndex++) {
            if(typeof form.elements[elemIndex] === 'button' || !form.elements[elemIndex].id) {
                continue;
            }
            if(form.elements[elemIndex].value === '') {
                continue;
            }
            values[form.elements[elemIndex].id] = form.elements[elemIndex].value;
        }
        return values;
    }

    activityCreation.addEventListener('submit', function(evt) {
        evt.preventDefault();

        //Get value from form field
        var body = getFormElementsValue(activityCreation);

        var formData = new FormData(activityCreation);

        for(let attr in body) {
            if(attr === 'gpx') {
                formData.append(attr, activityCreation.elements[attr].files[0], 'gpx');
            }
            formData.append(attr, body[attr]);
        }

        var request = new XMLHttpRequest();
        let userId = Util.getCookie('userId');
        request.open('POST', 'api/user/' + userId + '/activity', true);
        // request.setRequestHeader('Content-Type', "application/json");
        request.setRequestHeader('Authorization', 'Bearer ' + Util.getCookie("userToken"));

        request.onload = function() {
            var response = JSON.parse(this.responseText);
            if(!response.err) {
                errorMessage.innerText = "";
                return;
            }
            if(response.err.code === 'ER_TOKEN_VALIDATION') {
                errorMessage.innerText = 'Vous n\'êtes pas autorisé à effectué cette action';
                return;
            }
            errorMessage.innerText = 'Une erreur est survenue lors du traitement de la requête';
        }
        request.send(formData);
    })

    return center;
}