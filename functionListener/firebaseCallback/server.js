module.exports = (functions, tinyCfg, data) => {
    return new Promise(async function (resolve) {

        // Create Error
        tinyCfg.errorCallback = function (req, res, code, message) {
            throw new functions.https.HttpsError('failed-callback', `Error ${code}: ${message}`);
        };

        // Send Error
        const sendError = function (err) {

            // Create Error Data
            const errorResult = { success: false };
            if (err && typeof err.message === "string") { errorResult.error = err.message; }
            else if (typeof err === "string") {
                errorResult.error = err;
            } else {
                errorResult.error = 'Unknown Error';
                errorResult.data = err;
            }

            // Send Error
            resolve(errorResult);
            return;

        };

        // Modules
        const objType = require('@tinypudding/puddy-lib/get/objType');
        const optionalRequire = require('@tinypudding/puddy-lib/get/module');

        let logger = optionalRequire('@tinypudding/firebase-lib/logger');
        if (!logger) { logger = console; }

        // Validate Data
        if (objType(data, 'object') && objType(data.body, 'object') && objType(data.query, 'object') && objType(data.headers, 'object') && typeof data.rawBody === "string" && (typeof data.public_key === "string" || typeof data.public_key === "number")) {

            // Add Get Header
            data.get = (item) => {

                // Is String
                if (typeof data.headers[item] === "string" || typeof data.headers[item] === "number") {
                    return data.headers[item];
                } else {
                    return null;
                }

            };

            // Gateway Mode
            data.isGateway = true;

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
                await finalResult(data, res, logger, tinyCfg, require('../validator/checker')(data, res, logger, tinyCfg)).then(() => {
                    resolve({ success: true }); return;
                }).catch(err => { return sendError(err); });

            }

            // Nope
            else {
                await tinyCfg.errorCallback(null, null, 401, 'Invalid Bot Data!');
                return sendError('Invalid Bot Data!');
            }

        }

        // Nope
        else {
            await tinyCfg.errorCallback(null, null, 401, 'Invalid Body Data!');
            return sendError('Invalid Body Data!');
        }

    });
};