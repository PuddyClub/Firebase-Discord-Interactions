module.exports = function (req, res, logger, tinyCfg) {
    return function (client_id, public_key) {
        return new Promise(async (resolve, reject) => {

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
                            const versionItem = require('../version/' + req.body.version);
                            await versionItem(req, res, logger, di, tinyCfg);
                            resolve();
                            return;
                        } catch (err) {
                            await logger.error(err);
                            tinyCfg.errorCallback(req, res, 404, 'Version not found!');
                            reject(err);
                            return;
                        }

                    }

                    // Nope
                    else {
                        reject(new Error('Bad request signature!'));
                        return tinyCfg.errorCallback(req, res, 401, 'Bad request signature!');
                    }

                } catch (err) {
                    await logger.error(err);
                    tinyCfg.errorCallback(req, res, 500, err.message);
                    reject(err);
                    return;
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(req, res, 401, 'Invalid Public Key or Client ID!');
                reject(new Error('Invalid Public Key or Client ID!'));
            }

            // Complete
            return;

        });
    };
};