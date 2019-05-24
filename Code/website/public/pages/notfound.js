export default function(reason) {

    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    container.classList.add('notFoundContainer');
    center.appendChild(container);

    var logo = document.createElement('img');
    logo.src = "img/logo.svg";
    logo.classList.add('logoBig');
    container.appendChild(logo);

    let messageBox = document.createElement('div');
    messageBox.classList.add('messageBox');
    container.appendChild(messageBox);
    switch (reason) {
        case 'loggedOut':
            messageBox.innerText = ' Vous n\'êtes pas connecté';
            break;
        default: 
            messageBox.innerText = 'La page que vous demandé n\'existe pas';
            break;
    }

    return center;
}