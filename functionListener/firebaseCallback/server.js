module.exports = function (tinyCfg) {

    // Prepare Firebase Function
    const functions = require('firebase-functions');
    return functions.https.onCall(async (data) => {

        // Modules
        const objType = require('@tinypudding/puddy-lib/get/objType');
        const optionalRequire = require('@tinypudding/puddy-lib/get/module');

        let logger = optionalRequire('@tinypudding/firebase-lib/logger');
        if (!logger) { logger = console; }

        // App
        let app = null;

        // Exist Firebase
        if (objType(tinyCfg.firebase, 'object')) {

            // Debug
            if (tinyCfg.debug) {
                await logger.log('Preparing Firebase Config...');
                await logger.log(tinyCfg.firebase);
            }

            // New Firebase
            if (objType(tinyCfg.firebase.options, 'object')) {

                // Start Firebase
                const firebase = require('@tinypudding/firebase-lib');
                firebase.start(require('firebase-admin'), tinyCfg.firebase.options, tinyCfg.firebase.app);
                app = firebase.get(tinyCfg.firebase.options.id);

            }

            // Nope
            else { app = tinyCfg.firebase; }

        }

        // Prepare Response
        const res = {};

        // Get DB
        if (typeof data.query[tinyCfg.varNames.bot] === "string") {

            // Debug
            if (tinyCfg.debug) { await logger.log('Reading Bot String: ' + data.query[tinyCfg.varNames.bot]); }

            // Get App Values
            if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[data.query[tinyCfg.varNames.bot]], 'object')) {

                if ((typeof tinyCfg.app[data.query[tinyCfg.varNames.bot]].client_id === "string" || typeof tinyCfg.app[data.query[tinyCfg.varNames.bot]].client_id === "number") && (typeof tinyCfg.app[data.query[tinyCfg.varNames.bot]].public_key === "string" || typeof tinyCfg.app[data.query[tinyCfg.varNames.bot]].public_key === "number")) {

                    // Debug
                    if (tinyCfg.debug) { await logger.log('Bot Public Key was validated...'); }

                    // Prepare Validation
                    const di = require('discord-interactions');

                    try {

                        // Get Valid Request
                        const isValidRequest = await di.verifyKey(data.rawBody, data.headers['X-Signature-Ed25519'], data.headers['X-Signature-Timestamp'], tinyCfg.app[data.query[tinyCfg.varNames.bot]].public_key);

                        // Is Valid
                        if (isValidRequest) {

                            // Debug
                            if (tinyCfg.debug) { await logger.log('The command request was validated...'); }

                            // Version Validator
                            if (typeof data.body.version !== "number" || isNaN(data.body.version) || !isFinite(data.body.version) || data.body.version < 1) {
                                data.body.version = 1;
                            }

                            // Insert Client ID
                            data.body.client_id = tinyCfg.app[data.query[tinyCfg.varNames.bot]].client_id;

                            // Send Response
                            try {
                                return require('../version/' + data.body.version)(data, res, logger, di, tinyCfg);
                            } catch (err) {
                                await logger.error(err);
                                tinyCfg.errorCallback(data, res, 404, 'Version not found!');
                                return;
                            }

                        }

                        // Nope
                        else {
                            return tinyCfg.errorCallback(data, res, 401, 'Bad request signature!');
                        }

                    } catch (err) {
                        await logger.error(err);
                        tinyCfg.errorCallback(data, res, 500, err.message);
                        return;
                    }

                }

                // Nope
                else {
                    tinyCfg.errorCallback(data, res, 401, 'Invalid Public Key or Client ID!');
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(data, res, 404, 'App Data not found!');
            }

        }

        // Nope
        else {
            tinyCfg.errorCallback(data, res, 401, 'Invalid Bot Data!');
        }

        // Complete
        return;

    });

};