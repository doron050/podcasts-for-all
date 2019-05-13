const {
    getRouter
} = require("stremio-addon-sdk");
const addonInterface = require("./addon");
const landingTemplate = require("./landingTemplate");
const router = getRouter(addonInterface);

// landing page
const landingHTML = landingTemplate(addonInterface.manifest);

router.get('/redirectToAddonInstall', (_, res) => {

    response.writeHead(301, {
        Location: 'stremio://podcasts-for-all.ga/manifest.json'
    });
    response.end();
});

router.get('/', (_, res) => {
    res.setHeader('content-type', 'text/html');
    res.end(landingHTML);
});

module.exports = function (req, res) {
    router(req, res, function () {
        res.statusCode = 404;
        res.end();
    });
};