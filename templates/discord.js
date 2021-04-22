module.exports = function (bot, callback) {

    // Tiny Config
    const tinyCfg = {};

    // Force Invalid Command Callback
    tinyCfg.forceInvalidCommandCallback = true;

    // Error Callback
    tinyCfg.errorCallback = function () {
        return;
    };

    // Invalid Command
    tinyCfg.invalidCommandCallback = async function (result) {

        // Version 1
        if (result.interaction.version === 1) {

            // Channel
            result.interaction.channel = await bot.channels.fetch(result.interaction.channel_id);
            delete result.interaction.channel_id;

            // Guild
            result.interaction.guild = await bot.guilds.fetch(result.interaction.guild_id);
            delete result.interaction.guild_id;

            // User
            result.interaction.member = await result.interaction.guild.members.fetch(result.interaction.member.user.id);

            // Callback
            callback(result.interaction);

        }

        // Complete
        return;

    };

    // Start Module
    require('../functionListener/gateway')(tinyCfg, bot);

    // Complete
    return;

};