const {
    getRouter,
    publishToCentral
} = require("stremio-addon-sdk");
const addonInterface = require("./addon");
const landingTemplate = require("./landingTemplate");
const router = getRouter(addonInterface);

// landing page
const landingHTML = landingTemplate(addonInterface.manifest);

router.get('/redirectToAddonInstall', (_, res) => {

    res.writeHead(301, {
        Location: 'stremio://podcasts-for-all.ga/manifest.json'
    });
    res.end();
});
 
router.get('/', (_, res) => {
    res.setHeader('content-type', 'text/html');
    res.end(landingHTML);
});

publishToCentral("https://podcasts-for-all.ga/manifest.json");

module.exports = function (req, res) {
    router(req, res, function () {
        res.statusCode = 404;
        res.end();
    });
};