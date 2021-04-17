module.exports = async (functions, tinyCfg, data) => {

    // Create Error
    tinyCfg.errorCallback = function (req, res, code, message) {
        throw new functions.https.HttpsError('failed-callback', `Error ${code}: ${message}`);
    };

    // Modules
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const optionalRequire = require('@tinypudding/puddy-lib/get/module');

    let logger = optionalRequire('@tinypudding/firebase-lib/logger');
    if (!logger) { logger = console; }

    // Validate Data
    if (objType(data, 'object') && objType(data.body, 'object') && objType(data.query, 'object') && objType(data.headers, 'object') && typeof data.rawBody === "string" && (typeof data.public_key === "string" || typeof data.public_key === "number")) {

        // Prepare Response
        const res = {
            status: function () { return; },
            send: function () { return; },
            render: function () { return; },
            json: require('../interactionResponse')(`https://discord.com/api${data.apiVersion}/webhooks/${data.body.id}/${data.body.token}/messages/@original`, {
                method: 'PATCH'
            })
        };

        // Get DB
        if (typeof data.query[tinyCfg.varNames.bot] === "string") {

            // Complete Action
            const finalResult = require('../validator/send');

            try {
                await finalResult(data, res, logger, tinyCfg, require('../validator/checker')(req, res, logger, tinyCfg));
                return { success: true };
            } catch (err) {
                if (err && typeof err.message === "string") {
                    return { success: false, error: err.message };
                } else {
                    return { success: false, error: err };
                }
            }

        }

        // Nope
        else {
            await tinyCfg.errorCallback(null, null, 401, 'Invalid Bot Data!');
            return { success: false, error: 'Invalid Bot Data!' };
        }

    }

    // Nope
    else {
        await tinyCfg.errorCallback(null, null, 401, 'Invalid Body Data!');
        return { success: false, error: 'Invalid Body Data!' };
    }

};