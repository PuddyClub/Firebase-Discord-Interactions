module.exports = function (cfg, botToken) {

    // JSON Simulator
    const jsonSimulator = function (interaction) {
        return function (data) {
            const JSONfetch = require('@tinypudding/puddy-lib/http/fetch/json');
            return JSONfetch(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, {
                method: 'POST',
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    };

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

        // Create Bot
        const Discord = require('discord.js');
        bot = new Discord.Client({ autoReconnect: true });

        // Logs
        bot.on('rateLimit', (data) => { logger.warn(data); return; });
        bot.on('warn', (data) => { logger.warn(data); return; });
        bot.on('error', (data) => { logger.error(data); return; });

        bot.on('ready', () => { logger.log(`Bot Ready! ${bot.user.tag} (${bot.user.id})`); return; });

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
                    send: function () { return; },
                    render: function () { return; },
                    json: jsonSimulator(interaction)
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
    return bot;

};