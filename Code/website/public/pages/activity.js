export default function() {
    var center = document.createElement('div');
    center.classList.add('center');

    var container = document.createElement('div');
    container.classList.add('mainContainer');
    center.appendChild(container);

    var mapElement = document.createElement('div');
    mapElement.classList.add('googleMaps');
    container.appendChild(mapElement);

    var mapScript = document.createElement('script');
    mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEyReRC6xYEBR8neHbF91-HPrWcfwPIXU&callback=initMap';
    document.body.appendChild(mapScript);

    window.initMap = function() {
        let map = new google.maps.Map(mapElement, {
            center: {lat: 46.6, lng: 6.6},
            zoom: 10
        });

        let userToken = Util.getCookie('userToken');
        let path = [];
        Util.createRequest('GET', '/api/activity/' + '68d79819-b9b4-4057-8e38-a48859f3911e' + '/position', null, {Authorization: 'Bearer '+ userToken})
            .then(result => {
                result.forEach(point => {
                    path.push({
                        lat: point.latitude,
                        lng: point.longitude
                    });
                });
                var activityPath = new google.maps.Polyline({
					path: path,
					strokeColor: "#FF0000",
					strokeOpacity: .7,
					strokeWeight: 1.5
                });
              activityPath.setMap(map);
            });
      }

    return center;
}