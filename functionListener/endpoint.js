module.exports = async function (req, res, logger, tinyCfg) {

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

        // Debug
        if (tinyCfg.debug) {
            await logger.log('Using Firebase Config...');
            await logger.log(tinyCfg.firebase);
        }

        // Get DB
        if (typeof req.query[tinyCfg.varNames.bot] === "string") {

            // Debug
            if (tinyCfg.debug) { await logger.log('Reading Bot String: ' + req.query[tinyCfg.varNames.bot]); }

            // Firebase Lib
            const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
            const getDBData = require('@tinypudding/firebase-lib/getDBData');

            // Bot Var
            const db = app.db.ref(tinyCfg.appPath).child(databaseEscape(req.query[tinyCfg.varNames.bot]));

            // Get Public Key
            getDBData(db.child('public_key')).then(async public_key => {

                // Debug
                if (tinyCfg.debug) { await logger.log('Bot Public Key was read...'); }

                // Complete Action
                const completeAction = async function (client_id) {

                    if (typeof public_key === "string") {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Bot Public Key was validated...'); }

                        // Prepare Validation
                        const di = require('discord-interactions');
                        const signature = req.get('X-Signature-Ed25519');
                        const timestamp = req.get('X-Signature-Timestamp');

                        try {

                            // Get Valid Request
                            const isValidRequest = await di.verifyKey(req.rawBody, signature, timestamp, public_key);

                            // Is Valid
                            if (isValidRequest) {

                                // Debug
                                if (tinyCfg.debug) { await logger.log('The command request was validated...'); }

                                // Version Validator
                                if (typeof req.body.version !== "number" || isNaN(req.body.version) || !isFinite(req.body.version) || req.body.version < 1) {
                                    req.body.version = 1;
                                }

                                // Insert Client ID
                                req.body.client_id = client_id;

                                try {
                                    return require('./version/' + req.body.version)(req, res, logger, di, tinyCfg);
                                } catch (err) {
                                    await logger.error(err);
                                    tinyCfg.errorCallback(req, res, 404, 'Version not found!');
                                    return;
                                }

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
                        tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key!');
                    }

                    // Complete
                    return;

                };

                // Get Client ID
                if (tinyCfg.getClientID) {
                    getDBData(db.child('client_id')).then(async client_id => {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Bot Client ID was read...'); }

                        // Complete
                        await completeAction(client_id);
                        return;

                    }).catch(async err => {
                        await logger.error(err);
                        tinyCfg.errorCallback(req, res, 404, 'Bot ID not found!');
                        return;
                    });
                }

                // Nope
                else { await completeAction(null); }

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