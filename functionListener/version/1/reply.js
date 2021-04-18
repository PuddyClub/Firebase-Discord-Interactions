module.exports = (urlResult = {}, tinyCfg, logger, req, res) => {
    return (msg, isNewMessage = false) => {
        return new Promise(async (resolve, reject) => {

            // Preparing Module
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Prepare Result
            const result = {};

            // String Message
            if (typeof msg === "string") {
                result.data = { tts: false, content: msg };
            } else if (objType(msg, 'object')) {

                // Insert Data
                result.data = msg;

                // Embed
                if (objType(result.data.embed, 'object')) {
                    result.data.embeds = [result.data.embed];
                    delete result.data.embed;
                }

            }

            // Visible for you only
            if (typeof result.data.visible === "boolean" && result.data.visible === false) {
                result.data.flags = 64;
                delete result.data.visible;
            }

            // Debug
            if (tinyCfg.debug) { await logger.log('Sending message...'); }
            if (tinyCfg.debug) { await logger.log(result); }

            // Await Response
            if (urlResult.temp && isNewMessage === 'temp') {

                // Prepare Temp Reply
                result.type = 5;

                // Send Message
                urlResult.temp(result).then(data => { resolve(data); }).catch(err => { reject(err); });

            }

            // Is New Message
            /* else if (isNewMessage === "new") {
                result.type = 4;
                final_result.newMsg(result).then(data => { resolve(data); }).catch(err => { reject(err); });
            } */

            // Send Result
            else {

                // Type

                // Is Temp
                if (isNewMessage === 'temp') { result.type = 5; }

                // Nope
                else { result.type = 4; }

                // Custom Result
                if (urlResult.custom_result) {
                    urlResult.custom_result(result).then(data => { resolve(data); }).catch(err => { reject(err); });
                }

                // Normal JSON
                else if (!req.isGateway) {
                    resolve(); res.json(result);
                }

                // Nope
                else {
                    res.json(result).then(async (data) => { resolve(data); return; }).catch(async (err) => { reject(err); return; });
                }

            }

            // Complete
            return;

        });
    };
};