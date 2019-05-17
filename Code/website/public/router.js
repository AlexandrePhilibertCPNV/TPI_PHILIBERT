"use strict";

function Router() {
    var _this = this;

    this._displayedPage = false;
    this._pages = [];
    this._loadedPages = [];
    this._container;

    _this.setContainer = function(container) {
        _this._container = container;
    }
    
    /**
     * @param  {string} path    example : #activities
     * @param  {Element} page   root element from the page
     */
    this.register = function(path, page) {
        _this._pages[path] = page;
        if(typeof options === 'undefined') {
            return;
        }
    }

    
    /**
     * Load a page from _loadedPages if in cache or load a page from _pages if not
     * 
     * @param  {string} completePath  example : #activities
     */
    this.loadPage = function(completePath) {
        let path = completePath.split('/')[0];
        //if page has already been loaded before
        if(_this._loadedPages[path]) {
            if(_this._displayedPage) {
                _this._loadedPages[_this._displayedPage].style.display = "none";
            }
            _this._displayedPage = path;
            _this._loadedPages[path].style.display = "";
            console.log('Page ' + path + ' has been retreived from cache');
            return;
        }
        let page;
        if(typeof _this._pages[path] === 'function') {
            page = _this._pages[path]();
        } else {
            // page = _this.loadPage('notfound');
            window.location.hash = '#notfound';
        }
        if(_this._displayedPage) {
            _this._loadedPages[_this._displayedPage].style.display = "none";
        }
        _this._loadedPages[path] = page;
        _this._container.appendChild(page);
        _this._displayedPage = path;
        console.log('Page ' + path + ' has been loaded');
    }
}