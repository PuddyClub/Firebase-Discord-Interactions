module.exports = function (req, res, cfg) {

    // Config Template
    const tinyCfg = require('./cfgTemplate')(cfg);

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // End Point
    if (typeof req.query[tinyCfg.varNames.type] === "string" && req.query[tinyCfg.varNames.type] === "endpoint") {
        return require('./endpoint')(req, res, logger, tinyCfg);
    }

    // Nope
    else {
        return tinyCfg.errorCallback(req, res, 404, 'Discord Interaction API not found!');
    }

};