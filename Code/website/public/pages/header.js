export default function() {
    var header = document.createElement('div');
    header.classList.add('header');

    var menu = document.createElement('div');
    menu.classList.add('menu');
    header.appendChild(menu);

    let menuLogo = document.createElement('img');
    menuLogo.src = "img/logo.svg";
    menuLogo.classList.add('logo', "menuItem");
    menu.appendChild(menuLogo);
    
    [{name: 'activités', path: '/#activities'}, {name: 'créer une activité', path: '/#activityCreation'}].forEach(elem => {
        let menuItem = document.createElement('a');
        menuItem.innerText = elem.name;
        menuItem.setAttribute('href', elem.path);
        menuItem.classList.add('menuItem');
        menu.appendChild(menuItem);
    });

    return header;
}