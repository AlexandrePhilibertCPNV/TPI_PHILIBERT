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
    var switzerland = document.createElement('option');
    switzerland.value = 'f88d8c32-716d-11e9-8599-9215f1299811';
    switzerland.innerText = 'Suisse';
    countries.appendChild(switzerland);

    var places = document.createElement('select');
    var steCroix = document.createElement('option');
    steCroix.value = 'f88d8c32-746d-11e9-8499-9215f1299811'
    steCroix.innerText = 'Sainte-croix';
    places.appendChild(steCroix);
    leftPane.appendChild(createRow([locationLabel, countries, places]));

    var typeLabel = document.createElement('label');
    typeLabel.innerText = 'Type';
    typeLabel.setAttribute('for', 'activityTypeId'); 

    var type = document.createElement('select');
    type.id = 'activityTypeId';
    var running = document.createElement('option');
    running.value = 'f88d5c32-746d-11e9-8499-9218f1299311'
    running.innerText = 'Course à pied';
    type.appendChild(running);
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

    return center;
}