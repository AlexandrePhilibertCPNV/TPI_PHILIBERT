export default function() {

    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');

    container.innerText = 'La page que vous demandé n\'existe pas';
    center.appendChild(container);

    return center;
}