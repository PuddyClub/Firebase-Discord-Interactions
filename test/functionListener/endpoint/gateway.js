// Tiny Config
const tinyCfg = require('../../config.json');

// Error Callback
tinyCfg.errorCallback = function () {
    return;
};

// Invalid Command
tinyCfg.invalidCommandCallback = function (result) {

    // Debug
    console.log('Command Received!');
    console.log(result.data);
    
    // Reply
    bot.channels.fetch(result.data.channel_id).then(function(channel) {
        channel.send('Command Received!');
        return;
    });

    // Complete
    return;

};

// Start Module
const bot = require('../../../functionListener/gateway')(tinyCfg, tinyCfg.gateway_test_token);