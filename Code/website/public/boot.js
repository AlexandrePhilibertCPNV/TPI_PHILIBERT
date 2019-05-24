import activity from "./pages/activity.js";
import activites from "./pages/activites.js";
import activityCreation from "./pages/activityCreation.js";
import notFound from "./pages/notfound.js";
import Header from "./pages/header.js";

let header = new Header();

document.body.appendChild(header.create());

var router = new Router();
router.setContainer(document.body);
// register the pages
router.register('#activity', activity);
router.register('#activities', activites);
router.register('#notfound', notFound);
router.register('#activityCreation', activityCreation);

let userToken = Util.getCookie('userToken');
if(!userToken) {
    window.location.href = '#notfound/loggedOut';
}

// load page from url or load default one
if(window.location.hash) {
    router.loadPage(window.location.hash);
} else {
    window.location.hash = '#activityCreation';
}
header.notifyPageChange(window.location.hash);

window.addEventListener('hashchange', function(evt) {
    header.notifyPageChange(window.location.hash);
    router.loadPage(window.location.hash);
}); 