Util = {
   createRequest: function(method, path, body) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(method, path, true);
            request.onload = function(evt) {
                var response = JSON.parse(request.responseText);
                if(response.err) {
                    return reject(response.err);
                }
                resolve(response.data);
            };
            request.send(body);
        });
    }

}