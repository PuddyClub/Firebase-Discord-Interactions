module.exports = function (cfg, botToken) {

    // Config Template
    const tinyCfg = require('./cfgTemplate')(cfg);

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
    const bot = new Discord.Client({ autoReconnect: true });

    // Get Interaction Creation
    bot.ws.on("INTERACTION_CREATE", async interaction => {

        // Version Validator
        if (typeof interaction.version !== "number" || isNaN(interaction.version) || !isFinite(interaction.version) || interaction.version < 1) {
            interaction.version = 1;
        }

        // Return
        try {
            return require('./' + interaction.version)(

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
        } catch (err) {
            logger.error(err);
            return;
        }

    });

    // Log our bot in using the token
    bot.login(botToken);

    // Complete
    return;

};