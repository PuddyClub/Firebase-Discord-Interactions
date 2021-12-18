module.exports = function(tinyCfg) {
    return (req, res, msg) => {
        return new Promise(async(resolve, reject) => {

            // Modules
            const di = require('discord-interactions');
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Firebase
            let app = null;
            if (objType(tinyCfg.firebase, 'object')) { app = tinyCfg.firebase; }

            if (req.body.type === di.InteractionType.PING) {
                console.log(`The Bot ${req.query[tinyCfg.varNames.bot]} is trying to receive a pong.`);
                console.log(`BODY`);
                console.log(JSON.stringify(req.body, null, 2));
                console.log(`QUERY`);
                console.log(JSON.stringify(req.query, null, 2));
            }

            // Get DB
            if (typeof req.query[tinyCfg.varNames.bot] === "string") {

                // Debug
                if (tinyCfg.debug || req.body.type === di.InteractionType.PING) { console.log('Reading Bot String: ' + req.query[tinyCfg.varNames.bot]); }

                // Get App Values
                if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {

                    const botApp = tinyCfg.app[req.query[tinyCfg.varNames.bot]];
                    if ((typeof botApp.client_id === "string" || typeof botApp.client_id === "number") && (typeof botApp.public_key === "string" || typeof botApp.public_key === "number")) {

                        // Debug
                        if (tinyCfg.debug && req.body.type === di.InteractionType.PING) { console.log('Bot Public Key was validated...'); }

                        // Prepare Validation
                        const signature = req.get('X-Signature-Ed25519');
                        const timestamp = req.get('X-Signature-Timestamp');

                        try {

                            // Get Valid Request
                            const isValidRequest = await di.verifyKey(req.rawBody, signature, timestamp, botApp.public_key);

                            // Is Valid
                            if (isValidRequest) {

                                // Debug
                                if (tinyCfg.debug && req.body.type === di.InteractionType.PING) { console.log('The command request was validated...'); }

                                // Version Validator
                                if (typeof req.body.version !== "number" || isNaN(req.body.version) || !isFinite(req.body.version) || req.body.version < 1) {
                                    req.body.version = 1;
                                }

                                // Insert Client ID
                                req.body.client_id = botApp.client_id;

                                // Normal Request
                                if (req.body.type === di.InteractionType.APPLICATION_COMMAND) {

                                    // Preparing Hidden Detector
                                    tinyCfg.hiddenDetector = require('lodash').defaultsDeep({}, tinyCfg.hiddenDetector, {
                                        value: 'hide'
                                    });

                                    // Prepare is Hidden
                                    let isHidden;
                                    let getItem;
                                    let getValues;
                                    try {
                                        isHidden = require('../version/' + req.body.version + '/isHidden');
                                        getItem = require('../version/' + req.body.version + '/getValues');
                                        getValues = getItem = getItem.createFunctions(req.body);
                                    } catch (err) {
                                        isHidden = null;
                                        getItem = null;
                                    }

                                    // Use the Hidden
                                    if (isHidden && getItem) {
                                        msg = isHidden(msg, req.body, getValues, tinyCfg);
                                    }

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
                                    let reply;
                                    try { reply = require('../version/' + req.body.version + '/reply'); } catch (err) { reply = null; }
                                    if (reply) { return reply({}, tinyCfg, console, req, res)(msg, 'temp'); }

                                    // Nope
                                    else {
                                        console.error('Version not found!');
                                        return tinyCfg.errorCallback(req, res, 404, 'Version not found!');
                                    }

                                }

                                // Pong Request
                                else if (req.body.type === di.InteractionType.PING) {
                                    console.log(`The Bot ID ${req.body.client_id} received a pong.`);
                                    res.json({ type: di.InteractionResponseType.PONG });
                                }

                                // Nope
                                else {
                                    console.error('INVALID INTERACTION TYPE!');
                                    tinyCfg.errorCallback(req, res, 401, 'INVALID INTERACTION TYPE!');
                                }

                            }

                            // Nope
                            else {
                                console.error('Bad request signature!');
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
                        console.error('Invalid Public Key or Client ID!');
                        tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key or Client ID!');
                    }

                }

                // Nope
                else {
                    console.error('App Data not found!');
                    tinyCfg.errorCallback(req, res, 404, 'App Data not found!');
                }

            }

            // Nope
            else {
                console.error('Invalid Bot Data!');
                tinyCfg.errorCallback(req, res, 401, 'Invalid Bot Data!');
            }

            // Complete
            return;

        });
    };
};