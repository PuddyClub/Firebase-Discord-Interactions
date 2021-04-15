module.exports = function (tinyCfg) {
    return (req, res, msg) => {
        return new Promise(async (resolve, reject) => {

            // Modules
            const objType = require('@tinypudding/puddy-lib/get/objType');
            const optionalRequire = require('@tinypudding/puddy-lib/get/module');
            const logger = console;

            // App
            let app = null;

            // Exist Firebase
            if (objType(tinyCfg.firebase, 'object')) {

                // Debug
                if (tinyCfg.debug) {
                    logger.log('Preparing Firebase Config...');
                    logger.log(tinyCfg.firebase);
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
                if (tinyCfg.debug) { logger.log('Reading Bot String: ' + req.query[tinyCfg.varNames.bot]); }

                // Get App Values
                if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {

                    const botApp = tinyCfg.app[req.query[tinyCfg.varNames.bot]];
                    if ((typeof botApp.client_id === "string" || typeof botApp.client_id === "number") && (typeof botApp.public_key === "string" || typeof botApp.public_key === "number")) {

                        // Debug
                        if (tinyCfg.debug) { logger.log('Bot Public Key was validated...'); }

                        // Prepare Validation
                        const di = require('discord-interactions');
                        const signature = req.get('X-Signature-Ed25519');
                        const timestamp = req.get('X-Signature-Timestamp');

                        try {

                            // Get Valid Request
                            const isValidRequest = await di.verifyKey(req.rawBody, signature, timestamp, botApp.public_key);

                            // Is Valid
                            if (isValidRequest) {

                                // Debug
                                if (tinyCfg.debug) { logger.log('The command request was validated...'); }

                                // Version Validator
                                if (typeof req.body.version !== "number" || isNaN(req.body.version) || !isFinite(req.body.version) || req.body.version < 1) {
                                    req.body.version = 1;
                                }

                                // Insert Client ID
                                req.body.client_id = botApp.client_id;

                                // Normal Request
                                if (req.body.type !== di.InteractionType.PING) {

                                    // Send Function
                                    const commandCallback = app.root.functions().httpsCallable(tinyCfg.callbackName);
                                    commandCallback({

                                        // API Version
                                        apiVersion: 8,

                                        // Body
                                        body: req.body,

                                        // Query
                                        query: req.query,

                                        // Public Key
                                        public_key: botApp.public_key,

                                        // Headers
                                        headers: {
                                            'X-Signature-Ed25519': req.get('X-Signature-Ed25519'),
                                            'X-Signature-Timestamp': req.get('X-Signature-Timestamp')
                                        },

                                        // Raw Body
                                        rawBody: req.rawBody

                                    }).then(resolve).catch(reject);

                                    // Prepare Reply
                                    const reply = optionalRequire('../version/' + req.body.version + '/reply');
                                    if (reply) { return reply({}, tinyCfg, logger, req, res)(msg, 'temp'); }

                                    // Nope
                                    else { return tinyCfg.errorCallback(req, res, 404, 'Version not found!'); }

                                }

                                // Pong Request
                                else { res.json({ type: di.InteractionResponseType.PONG }); }

                            }

                            // Nope
                            else {
                                return tinyCfg.errorCallback(req, res, 401, 'Bad request signature!');
                            }

                        } catch (err) {
                            logger.error(err);
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