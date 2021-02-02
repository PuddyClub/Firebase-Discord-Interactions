module.exports = function (cfg, botToken) {

    // Config Template
    const tinyCfg = require('./cfgTemplate')(cfg);

    // Import the discord interacctions module
    const di = require('discord-interactions');

    // Logger
    let logger = null;
    try {
        logger = require('@tinypudding/firebase-lib/logger');
    } catch (err) {
        logger = console;
    }

    // Create an instance of a Discord client
    let bot = null;

    // Create Discord Bot
    if (typeof botToken === "string") {
        const Discord = require('discord.js');
        bot = new Discord.Client({ autoReconnect: true });
    } else {
        bot = botToken;
    }

    // Get Interaction Creation
    bot.ws.on("INTERACTION_CREATE", async interaction => {

        // Version Validator
        if (typeof interaction.version !== "number" || isNaN(interaction.version) || !isFinite(interaction.version) || interaction.version < 1) {
            interaction.version = 1;
        }

        // Return
        try {
            return require('./version/' + interaction.version)(

                // Body
                { body: interaction },

                // Res
                {
                    status: function () { return; },
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
    if (typeof botToken === "string") { bot.login(botToken).catch(err => { logger.error(err); return; }); }

    // Complete
    return;

};