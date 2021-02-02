// Tiny Config
const tinyCfg = require('../../config.json');

// Error Callback
tinyCfg.errorCallback = function () {
    return;
};

// Invalid Command
tinyCfg.invalidCommandCallback = function (result) {

    // Debug
    console.log(result.data);

    // Complete
    return;

};

// Start Module
require('../../../functionListener/gateway')(tinyCfg, tinyCfg.gateway_test_token);