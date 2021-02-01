module.exports = async function (req, res, logger, tinyCfg) {

    // Start Firebase
    const firebase = require('@tinypudding/firebase-lib');
    firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);

    // App
    const app = firebase.get(tinyCfg.options.id);
    let db = null;

    // Get DB
    if (typeof req.query.bot === "string") {
        db = app.db.ref('apps').child(firebase.databaseEscape(req.query.bot));
    } else {
        db = app.db.ref('bot_tester');
    }

    // Get Public Key
    const public_key = await firebase.getDBData(db.child('public_key'));
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

};