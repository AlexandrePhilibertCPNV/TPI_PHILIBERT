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
    
    this.register = function(path, page, options) {
        _this._pages[path] = page;
        if(typeof options === 'undefined') {
            return;
        }
        if(options.default) {
            _this.loadPage(path);
        }
    }

    this.loadPage = function(path) {
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
            page = _this.loadPage('notfound');
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