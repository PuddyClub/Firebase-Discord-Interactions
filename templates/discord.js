module.exports = function (bot, callback) {

    // Tiny Config
    const tinyCfg = {};

    // Error Callback
    tinyCfg.errorCallback = function () {
        return;
    };

    // Invalid Command
    tinyCfg.invalidCommandCallback = function (result) {

        console.log(result.data);

        // Callback
        callback();

        // Complete
        return;

    };

    // Start Module
    const bot = require('../functionListener/gateway')(tinyCfg, bot);

    // Complete
    return;

};