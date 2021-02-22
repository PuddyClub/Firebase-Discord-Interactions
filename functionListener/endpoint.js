module.exports = function (req, res, logger, tinyCfg) {

    // Object Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // App
    let app = null;

    // Exist Firebase
    if (objType(tinyCfg.firebase, 'object')) {

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

    // Exist Firebase
    if (app) {

        // Get DB
        if (typeof req.query[tinyCfg.varNames.bot] === "string") {

            // Firebase Lib
            const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
            const getDBData = require('@tinypudding/firebase-lib/getDBData');

            // Bot Var
            const db = app.db.ref(tinyCfg.appPath).child(databaseEscape(req.query[tinyCfg.varNames.bot]));

            // Get Public Key
            getDBData(db.child('public_key')).then(async public_key => {

                // Complete Action
                const completeAction = function (client_id) {

                    if (typeof public_key === "string") {

                        // Prepare Validation
                        const di = require('discord-interactions');
                        const signature = req.get('X-Signature-Ed25519');
                        const timestamp = req.get('X-Signature-Timestamp');

                        try {

                            // Get Valid Request
                            const isValidRequest = await di.verifyKey(req.rawBody, signature, timestamp, public_key);

                            // Is Valid
                            if (isValidRequest) {

                                // Version Validator
                                if (typeof req.body.version !== "number" || isNaN(req.body.version) || !isFinite(req.body.version) || req.body.version < 1) {
                                    req.body.version = 1;
                                }

                                // Insert Client ID
                                req.body.client_id = client_id;

                                try {
                                    return require('./version/' + req.body.version)(req, res, logger, di, tinyCfg);
                                } catch (err) {
                                    logger.error(err);
                                    tinyCfg.errorCallback(req, res, 404, 'Version not found!');
                                    return;
                                }

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
                        tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key!');
                    }

                    // Complete
                    return;

                };

                // Get Client ID
                if (tinyCfg.getClientID) {
                    getDBData(db.child('client_id')).then(async client_id => {
                        completeAction(client_id);
                        return;
                    }).catch(err => {
                        tinyCfg.errorCallback(req, res, 404, 'Bot ID not found!');
                        return;
                    });
                }

                // Nope
                else { completeAction(null); }

                // Complete
                return;

            }).catch(err => {
                tinyCfg.errorCallback(req, res, 404, 'Bot Public Key not found!');
                return;
            });

        }

        // Nope
        else {
            tinyCfg.errorCallback(req, res, 401, 'Invalid Bot Data!');
        }

    }

    // Nope
    else {
        tinyCfg.errorCallback(req, res, 500, 'Main Server not found!');
    }

    // Complete
    return;

};