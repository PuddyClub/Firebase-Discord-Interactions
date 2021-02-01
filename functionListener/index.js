module.exports = function (req, res, cfg) {

    // Prepare Modules
    const _ = require('lodash');

    // Tiny Config
    const tinyCfg = _.defaultsDeep({}, cfg, {
        
        // Error Callback
        errorCallback: function (req, res, code, message) {
            res.status(code);
            return res.json({ error: true, code: code, message: message });
        }

    });

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // End Point
    if (typeof req.query.type === "string" && req.query.type === "endpoint") {
        return require('./endpoint')(req, res, logger, tinyCfg);
    }

    // Nope
    else {
        return tinyCfg.errorCallback(req, res, 404, 'Discord Interaction API not found!');
    }

};