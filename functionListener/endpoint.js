module.exports = async function (req, res, logger, tinyCfg) {

    // Object Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // App
    let app = null;

    // Exist Firebase
    if (objType(tinyCfg.firebase, 'object')) {

        // Debug
        if (tinyCfg.debug) {
            await logger.log('Using Firebase Config...');
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

        // Firebase Lib
        const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
        const getDBData = require('@tinypudding/firebase-lib/getDBData');

        // Complete Action
        const completeAction = async function (client_id, public_key) {

            if ((typeof client_id === "string" || typeof client_id === "number") && (typeof public_key === "string" || typeof public_key === "number")) {

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
                tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key or Client ID!');
            }

            // Complete
            return;

        };

        // Exist App Firebase
        if (app) {

            // Bot Var
            const db = app.db.ref(tinyCfg.appPath).child(databaseEscape(req.query[tinyCfg.varNames.bot]));

            // Get Public Key
            getDBData(db.child('public_key')).then(async public_key => {

                // Debug
                if (tinyCfg.debug) { await logger.log('Bot Public Key was read...'); }

                // Get Client ID
                if (tinyCfg.getClientID) {
                    getDBData(db.child('client_id')).then(async client_id => {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Bot Client ID was read...'); }

                        // Complete
                        await completeAction(client_id, public_key);
                        return;

                    }).catch(async err => {
                        await logger.error(err);
                        tinyCfg.errorCallback(req, res, 404, 'Bot ID not found!');
                        return;
                    });
                }

                // Nope
                else { await completeAction(); }

                // Complete
                return;

            }).catch(err => {
                tinyCfg.errorCallback(req, res, 404, 'Bot Public Key not found!');
                return;
            });

        }

        // Get App Values
        else if (objType(tinyCfg.app, 'object') && objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object')) {
            await completeAction(tinyCfg.app[req.query[tinyCfg.varNames.bot]].client_id, tinyCfg.app[req.query[tinyCfg.varNames.bot]].public_key);
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

};