module.exports = function (url, options, extraCfg = {}) {
    
    // Config
    const tinyCfg = require('lodash').defaultsDeep({}, options, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Return Data
    return function (data) {
        return new Promise(function (resolve, reject) {

            // Fix Message
            if(extraCfg.fixData) {
                
                // Exist Data
                const objType = require('@tinypudding/puddy-lib/get/objType');
                if(objType(tinyCfg.body, 'object') && objType(tinyCfg.body.data, 'object') && (
                    typeof tinyCfg.body.data.content === "string" ||
                    Array.isArray(tinyCfg.body.data.embeds)
                )) {
                    tinyCfg.body = tinyCfg.body.data;
                }

            }

            const logger = require('@tinypudding/firebase-lib/logger');
            logger.log(tinyCfg);

            // JSON Fetch
            const JSONfetch = require('@tinypudding/puddy-lib/http/fetch/json');
            tinyCfg.body = JSON.stringify(data);
            JSONfetch(url, tinyCfg)
            
            // Something
            .then(data => {
                resolve(data);
                return;
            })
            
            // Error
            .catch(err => {
                
                // Fail JSON Skip
                if (!err.message.startsWith('invalid json response body')) {
                    reject(err);
                } else {
                    resolve({});
                }

                // Complete
                return;

            });

            // Complete
            return;

        });
    };

};