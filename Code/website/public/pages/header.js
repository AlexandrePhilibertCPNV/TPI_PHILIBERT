export default function() {

    var _this = this;

    this._pages = [
        {name: 'activités', path: '#activities'}, 
        {name: 'créer une activité', path: '#activityCreation'}
    ];
    this._menuItems = {};

    _this.notifyPageChange = function(path) {
        for(let pageName in _this._menuItems) {
            this._menuItems[pageName].classList.remove('menuItemCurrent');
        }
        this._menuItems[path].classList.add('menuItemCurrent');
    }

    _this.create = function() {
        var header = document.createElement('div');
        header.classList.add('header');
    
        var menu = document.createElement('div');
        menu.classList.add('menu');
        header.appendChild(menu);
    
        let menuLogo = document.createElement('img');
        menuLogo.src = "img/logo.svg";
        menuLogo.classList.add('logo', "menuItem");
        menu.appendChild(menuLogo);
        
        _this._pages.forEach(page => {
            let menuItem = document.createElement('a');
            menuItem.innerText = page.name;
            menuItem.setAttribute('href', page.path);
            menuItem.classList.add('menuItem');
            _this._menuItems[page.path] = menuItem;
            menu.appendChild(menuItem);
        });  
        return header;
    }
}