module.exports = function (cfg) {

    // Config Template
    const tinyCfg = require('../cfgTemplate')(cfg);

    // Import the discord module
    const Discord = require('discord.js');
    const di = require('discord-interactions');

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // Create an instance of a Discord client
    const client = new Discord.Client({ autoReconnect: true });

    // Log our bot in using the token from https://discord.com/developers/applications
    client.login('your token here');

    bot.ws.on("INTERACTION_CREATE", async interaction => {

        // Return
        return require('./1')(

            // Body
            { body: interaction },

            // Res
            {
                json: function () { return; },
                send: function () { return; },
                render: function () { return; }
            },

            // Logger
            logger,

            // discord-interactions
            di,

            // Tiny Config
            tinyCfg

        );

    });

    // Complete
    return;

};