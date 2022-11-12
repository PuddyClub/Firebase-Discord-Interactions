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
    return require('./endpoint')(req, res, logger, tinyCfg);

};