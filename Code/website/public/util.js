Util = {
   createRequest: function(method, path, body, headers) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(method, path, true);
            for(let key in headers) {
                request.setRequestHeader(key, headers[key]);
            }
            request.onload = function(evt) {
                var response = JSON.parse(request.responseText);
                if(response.err) {
                    return reject(response.err);
                }
                resolve(response.data);
            };
            request.send(JSON.stringify(body));
        });
    },
    // Taken from : https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
    setCookie: function(name, value, days) {
        var date = new Date(Date.now() + 24*60*60*1000*days);
        //Store cookie with name, value and expire time
	    document.cookie = name + "=" + value + ";path=/;expires=" + date.toGMTString();
    },
    getCookie: function(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	    return v ? v[2] : undefined;
    }

}