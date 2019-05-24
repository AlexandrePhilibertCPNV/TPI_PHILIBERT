export default function() {
    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    container.classList.add('activityCreationContainer');
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

    var commonFormPart = document.createElement('div');
    commonFormPart.classList.add('formPart');
    activityCreation.appendChild(commonFormPart);

    var gpxFormPart = document.createElement('div');
    gpxFormPart.classList.add('formPart');
    activityCreation.appendChild(gpxFormPart);

    var remainingFormPart = document.createElement('div');
    remainingFormPart.classList.add('formPart');
    activityCreation.appendChild(remainingFormPart);

    var actionFormPart = document.createElement('div');
    actionFormPart.classList.add('formPart');
    actionFormPart.classList.add('formPartActions');
    activityCreation.appendChild(actionFormPart);

    var locationLabel = document.createElement('label');
    locationLabel.classList.add('formLabelLeft');
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
    commonFormPart.appendChild(createRow([locationLabel, countries, places]));

    // Populate place field with data from API
    countries.addEventListener('change', evt => {
        var selectedCountryId = countries.options[countries.selectedIndex].value;
        places.innerHTML = '';
        queryPlaces(selectedCountryId, places)
    });

    var typeLabel = document.createElement('label');
    typeLabel.classList.add('formLabelLeft');
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

    commonFormPart.appendChild(createRow([typeLabel, type]));

    function handleRemainingFieldsVisiblity(evt) {
        if(gpxWithRadio.checked) {
            remainingFormPart.classList.add('formPartHidden');
            gpxRow.classList.remove('formRowHidden');
            gpxFile.required = true;
            startDate.required = false;
            startTime.required = false; 
            endDate.required = false; 
            endTime.required = false;
            distance.required = false;
            posHeightDiff.required = false;
            negHeightDiff.required = false;
            return;
        }
        remainingFormPart.classList.remove('formPartHidden');
        gpxRow.classList.add('formRowHidden');
        remainingFormPart.style.display = 'block';
        gpxFile.required = false;
        startDate.required = true;
        startTime.required = true; 
        endDate.required = true; 
        endTime.required = true;
        distance.required = true;
        posHeightDiff.required = true;
        negHeightDiff.required = true;
    }

    var gpxWithLabel = document.createElement('label');
    gpxWithLabel.setAttribute('for', 'withGPX');
    gpxWithLabel.innerText = 'Avec GPX';

    var gpxWithRadio = document.createElement('input');
    gpxWithRadio.type = 'radio';
    gpxWithRadio.id = 'withGPX';
    gpxWithRadio.name = 'withGPX';
    gpxWithRadio.value = true;
    gpxWithRadio.checked = true;

    gpxWithRadio.addEventListener('change', handleRemainingFieldsVisiblity)

    var gpxWithoutLabel = document.createElement('label');
    gpxWithoutLabel.setAttribute('for', 'withoutGPX');
    gpxWithoutLabel.innerText = 'Sans GPX';

    var gpxWithoutRadio = document.createElement('input');
    gpxWithoutRadio.type = 'radio';
    gpxWithoutRadio.id = 'withoutGPX';
    gpxWithoutRadio.name = 'withGPX';
    gpxWithoutRadio.value = false;

    gpxWithoutRadio.addEventListener('change', handleRemainingFieldsVisiblity)
    
    gpxFormPart.appendChild(createRow([gpxWithLabel, gpxWithRadio, gpxWithoutLabel, gpxWithoutRadio]));

    var gpxFileLabel = document.createElement('label');
    gpxFileLabel.classList.add('formLabelLeft');
    gpxFileLabel.setAttribute('for', 'gpx');
    gpxFileLabel.innerText = 'GPX';

    var gpxFile = document.createElement('input');
    gpxFile.id = 'gpx';
    gpxFile.type = 'file';
    gpxFile.required = true;

    var gpxRow = createRow([gpxFileLabel, gpxFile]);
    gpxFormPart.appendChild(gpxRow);

    var startLabel = document.createElement('label');
    startLabel.classList.add('formLabelLeft');
    startLabel.setAttribute('for', 'start_timestamp');
    startLabel.innerText = 'Début';
    
    var startDate = document.createElement('input');
    startDate.type = 'date';
    startDate.value = new Date().toISOString().split('T')[0];

    var startTime = document.createElement('input');
    startTime.type = 'time';
    startTime.value = '12:00';
    remainingFormPart.appendChild(createRow([startLabel, startDate, startTime]));

    var endLabel = document.createElement('label');
    endLabel.classList.add('formLabelLeft');
    endLabel.setAttribute('for', 'end_timestamp');
    endLabel.innerText = 'Fin';

    var endDate = document.createElement('input');
    endDate.type = 'date';
    endDate.value = new Date().toISOString().split('T')[0];

    var endTime = document.createElement('input');
    endTime.type = 'time';
    endTime.value = '12:00';
    remainingFormPart.appendChild(createRow([endLabel, endDate, endTime]));

    var distanceLabel = document.createElement('label');
    distanceLabel.classList.add('formLabelLeft');
    distanceLabel.setAttribute('for', 'distance');
    distanceLabel.innerText = 'Distance (km)';

    var distance = document.createElement('input');
    distance.id = "distance";
    distance.type = 'number';
    distance.step = "0.01";
    distance.min = 0;

    remainingFormPart.appendChild(createRow([distanceLabel, distance]));

    var posHeightDiffLabel = document.createElement('label');
    posHeightDiffLabel.classList.add('formLabelLeft');
    posHeightDiffLabel.setAttribute('for', 'total_positive_height_diff');
    posHeightDiffLabel.innerText = 'Dénivelé positif (m)';

    var posHeightDiff = document.createElement('input');
    posHeightDiff.id = "total_positive_height_diff";
    posHeightDiff.type = 'number';
    posHeightDiff.min = 0;

    remainingFormPart.appendChild(createRow([posHeightDiffLabel, posHeightDiff]));

    var negHeightDiffLabel = document.createElement('label');
    negHeightDiffLabel.classList.add('formLabelLeft');
    negHeightDiffLabel.setAttribute('for', 'total_negative_height_diff');
    negHeightDiffLabel.innerText = 'Dénivelé négatif (m)';

    var negHeightDiff = document.createElement('input');
    negHeightDiff.id = "total_negative_height_diff";
    negHeightDiff.type = 'number';
    negHeightDiff.min = 0;

    remainingFormPart.appendChild(createRow([negHeightDiffLabel, negHeightDiff]));

    var errorContainer = document.createElement('div');
    errorContainer.classList.add('errorContainer');

    var errorMessage = document.createElement('div');
    errorMessage.classList.add('errorMessage');
    errorContainer.appendChild(errorMessage);

    var loadingBarContainer = document.createElement('div');
    loadingBarContainer.classList.add('loadingBarContainer');
    loadingBarContainer.style.display = 'none';
    actionFormPart.appendChild(loadingBarContainer);

    var loadingBar = document.createElement('div');
    loadingBar.classList.add('loadingBar');
    loadingBar.style.width = '0px';
    loadingBarContainer.appendChild(loadingBar);

    var submitButton = document.createElement('button');
    submitButton.type = "submit";
    submitButton.innerText = "Créer";

    var formRowActions = createRow([errorContainer, submitButton])
    formRowActions.classList.add('formRowActions');
    actionFormPart.appendChild(formRowActions);

    handleRemainingFieldsVisiblity();

    activityCreation.addEventListener('submit', function(evt) {
        evt.preventDefault();

        let formData = new FormData();
        formData.append('placeId', places.value)
        formData.append('activityTypeId', type.value);
        // If gpx is set append it to formData
        if(gpxFile.files[0]) {
            formData.append('gpx', gpxFile.files[0])
        } else {
            let startTimestamp = new Date(startDate.value + ' ' + startTime.value);
            let endTimestamp = new Date(endDate.value + ' ' + endTime.value);
            formData.append('start_timestamp', startTimestamp.toISOString());
            formData.append('end_timestamp', endTimestamp.toISOString());
            formData.append('total_distance_km', distance.value);
            formData.append('total_positive_height_diff', posHeightDiff.value);
            formData.append('total_negative_height_diff', negHeightDiff.value);
        }

        var request = new XMLHttpRequest();
        let userId = Util.getCookie('userId');
        request.open('POST', 'api/user/' + userId + '/activity', true);
        // request.setRequestHeader('Content-Type', "application/json");
        request.setRequestHeader('Authorization', 'Bearer ' + Util.getCookie("userToken"));

        // Handle loadingBar progression
        loadingBarContainer.style.display = 'block';
        loadingBar.style.width = '0px';
        request.upload.onprogress = function(evt) {
            loadingBar.style.width = (evt.loaded / evt.total) * 100 + '%';
        }

        request.onload = function() {
            // Reset UI
            loadingBar.style.width = '0px';

            var response = JSON.parse(this.responseText);
            if(!response.err) {
                errorMessage.innerText = "";
                if(gpxFile.files[0]) {
                    window.location.hash = '#activity/' + response.data[0].id;
                    return;
                }
                window.location.hash = '#activities';
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