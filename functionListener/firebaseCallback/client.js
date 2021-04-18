module.exports = function (tinyCfg) {
    return (req, res, msg) => {
        return new Promise(async (resolve, reject) => {

            // Modules
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Firebase
            let app = null;
            if (objType(tinyCfg.firebase, 'object')) { app = tinyCfg.firebase; }

            // Get DB
            if (typeof req.query[tinyCfg.varNames.bot] === "string") {

                // Debug
                if (tinyCfg.debug) { console.log('Reading Bot String: ' + req.query[tinyCfg.varNames.bot]); }

                // Get App Values
                if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {

                    const botApp = tinyCfg.app[req.query[tinyCfg.varNames.bot]];
                    if ((typeof botApp.client_id === "string" || typeof botApp.client_id === "number") && (typeof botApp.public_key === "string" || typeof botApp.public_key === "number")) {

                        // Debug
                        if (tinyCfg.debug) { console.log('Bot Public Key was validated...'); }

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
                                if (tinyCfg.debug) { console.log('The command request was validated...'); }

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

                                        // Client ID
                                        client_id: botApp.client_id,

                                        // Headers
                                        headers: {
                                            'X-Signature-Ed25519': req.get('X-Signature-Ed25519'),
                                            'X-Signature-Timestamp': req.get('X-Signature-Timestamp')
                                        },

                                        // Raw Body
                                        rawBody: req.rawBody

                                    }).then(resolve).catch(reject);

                                    // Prepare Reply
                                    let reply; try { reply = require('../version/' + req.body.version + '/reply'); } catch (err) { reply = null; }
                                    if (reply) { return reply({}, tinyCfg, console, req, res)(msg, 'temp'); }

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

                            if (!tinyCfg.objString) { console.error(err); } else {
                                console.error(JSON.stringify(err, null, 2));
                            }

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