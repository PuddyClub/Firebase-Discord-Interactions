module.exports = function (req, res, tinyCfg) {

    // Error Page
    const error_page = function (res, code, message) {
        res.status(code);
        return res.json({error: true, code: code, message: message});
    };

    // Logger
    const logger = require('@tinypudding/firebase-lib/logger');

    // End Point
    if (typeof req.query.type === "string" && req.query.type === "endpoint") {
        return require('./endpoint')(req, res, error_page, logger, tinyCfg);
    }

    // Nope
    else {
        return error_page(res, 404, 'Discord Interaction API not found!');
    }

};