module.exports = function (url, options) {
    
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