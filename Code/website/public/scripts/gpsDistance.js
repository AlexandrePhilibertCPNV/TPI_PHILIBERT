 // Taken from gps-distance node module
 var RADIUS = 6371;

 var toRad = function(n) {
 return n * Math.PI / 180;
 };

 var getDistance = function(from, to) {
     var fromLat = from.latitude;
     var fromLon = from.longitude;
     var toLat = to.latitude;
     var toLon = to.longitude;

     var dLat = toRad(toLat - fromLat);
     var dLon = toRad(toLon - fromLon);
     var fromLat = toRad(fromLat);
     var toLat = toRad(toLat);

     var a = Math.pow(Math.sin(dLat / 2), 2) +
             (Math.pow(Math.sin(dLon / 2), 2) * Math.cos(fromLat) * Math.cos(toLat));
     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

     return RADIUS * c;
 };
 
 export default getDistance;