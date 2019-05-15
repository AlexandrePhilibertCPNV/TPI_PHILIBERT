import activites from "./pages/activites.js";
import activityCreation from "./pages/activityCreation.js";
import notFound from "./pages/notfound.js";
import header from "./pages/header.js";

document.body.appendChild(header());

var router = new Router();
router.setContainer(document.body);
router.register('activities', activites);
router.register('notfound', notFound);
router.register('activityCreation', activityCreation);

router.loadPage(document.location.hash.split("#")[1]);

window.addEventListener('hashchange', function(evt) {
    router.loadPage(document.location.hash.split("#")[1]);
}); 