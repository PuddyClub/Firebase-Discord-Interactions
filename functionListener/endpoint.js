module.exports = function (req, res, logger, tinyCfg) {

    // Start Firebase
    const firebase = require('@tinypudding/firebase-lib');
    firebase.start(require('firebase-admin'), tinyCfg.firebase.options, tinyCfg.firebase.app);

    // App
    const app = firebase.get(tinyCfg.firebase.options.id);

    // Get DB
    if (typeof req.query.bot === "string") {

        // Bot Var
        const db = app.db.ref(tinyCfg.appPath).child(firebase.databaseEscape(req.query.bot));

        // Get Public Key
        firebase.getDBData(db.child('public_key')).then(async public_key => {

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
                            tinyCfg.errorCallback(res, 404, 'Version not found!');
                            return;
                        }

                    }

                    // Nope
                    else {
                        return tinyCfg.errorCallback(res, 401, 'Bad request signature!');
                    }

                } catch (err) {
                    logger.error(err);
                    tinyCfg.errorCallback(res, 500, err.message);
                    return;
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(res, 401, 'Invalid Public Key!');
            }

            // Complete
            return;

        }).catch(err => {
            tinyCfg.errorCallback(res, 404, 'Bot Public Key not found!');
        });

    }

    // Nope
    else {
        tinyCfg.errorCallback(res, 401, 'Invalid Bot Data!');
    }

    // Complete
    return;

};