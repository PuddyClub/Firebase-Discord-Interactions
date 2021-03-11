module.exports = function (tinyCfg) {
    return (req, res, msg) => {
        return new Promise((resolve, reject) => {

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

            // Get DB
            if (typeof req.query[tinyCfg.varNames.bot] === "string") {

                // Debug
                if (tinyCfg.debug) { await logger.log('Reading Bot String: ' + req.query[tinyCfg.varNames.bot]); }

                // Get App Values
                if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {

                    if ((typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].client_id === "string" || typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].client_id === "number") && (typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key === "string" || typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key === "number")) {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Bot Public Key was validated...'); }

                        // Prepare Validation
                        const di = require('discord-interactions');
                        const signature = req.get('X-Signature-Ed25519');
                        const timestamp = req.get('X-Signature-Timestamp');

                        try {

                            // Get Valid Request
                            const isValidRequest = await di.verifyKey(req.rawBody, signature, timestamp, tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key);

                            // Is Valid
                            if (isValidRequest) {

                                // Debug
                                if (tinyCfg.debug) { await logger.log('The command request was validated...'); }

                                // Version Validator
                                if (typeof req.body.version !== "number" || isNaN(req.body.version) || !isFinite(req.body.version) || req.body.version < 1) {
                                    req.body.version = 1;
                                }

                                // Insert Client ID
                                req.body.client_id = tinyCfg.app[req.query[tinyCfg.varNames.bot]].client_id;

                                // Send Function
                                const commandCallback = app.root.functions().httpsCallable(tinyCfg.callbackName);
                                commandCallback({ body: req.body, public_key: tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key }).then(resolve).catch(reject);

                                // Prepare Reply
                                const reply = optionalRequire('../version/' + req.body.version + '/reply');
                                if (reply) {
                                    return reply({}, tinyCfg, logger, req, res)(msg);
                                }

                                // Nope
                                else { return tinyCfg.errorCallback(req, res, 404, 'Version not found!'); }

                            }

                            // Nope
                            else {
                                return tinyCfg.errorCallback(req, res, 401, 'Bad request signature!');
                            }

                        } catch (err) {
                            await logger.error(err);
                            tinyCfg.errorCallback(req, res, 500, err.message);
                            return;
                        }

                    }

                    // Nope
                    else {
                        tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key or Client ID!');
                    }

                }

                // Nope
                else {
                    tinyCfg.errorCallback(req, res, 404, 'App Data not found!');
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(req, res, 401, 'Invalid Bot Data!');
            }

            // Complete
            return;

        });
    };
};