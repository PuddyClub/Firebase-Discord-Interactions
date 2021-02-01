module.exports = function (req, res, logger, tinyCfg) {

    // Object Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // App
    let app = null;

    // Exist Firebase
    if (objType(tinyCfg.firebase)) {

        // New Firebase
        if (objType(tinyCfg.firebase.options)) {

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
        if (typeof req.query.bot === "string") {

            // Firebase Lib
            const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
            const getDBData = require('@tinypudding/firebase-lib/getDBData');

            // Bot Var
            const db = app.db.ref(tinyCfg.appPath).child(databaseEscape(req.query.bot));

            // Get Public Key
            getDBData(db.child('public_key')).then(async public_key => {

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

                            try {
                                return require('./version/' + req.body.version)(req, res, logger, di);
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