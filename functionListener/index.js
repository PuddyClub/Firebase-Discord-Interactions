module.exports = function (req, res, cfg) {

    // Prepare Modules
    const _ = require('lodash');

    // Tiny Config
    const tinyCfg = _.defaultsDeep({}, cfg, {

        // Commands
        commands: {},

        // Var Names
        varNames: {

            // Type
            type: 'type'

        },

        // Error Callback
        errorCallback: function (req, res, code, message) {
            res.status(code);
            return res.json({ error: true, code: code, message: message });
        },

        // Invalid Command
        invalidCommandCallback: function (data, res, di) {
            return res.json({
                type: di.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: 'This command has no functionality!'
                },
            });
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
    if (typeof req.query[tinyCfg.varNames.type] === "string" && req.query[tinyCfg.varNames.type] === "endpoint") {
        return require('./endpoint')(req, res, logger, tinyCfg);
    }

    // Nope
    else {
        return tinyCfg.errorCallback(req, res, 404, 'Discord Interaction API not found!');
    }

};