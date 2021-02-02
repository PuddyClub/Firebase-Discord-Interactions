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
        if (result.data.version === 1) {

            // Channel
            result.data.channel = await bot.channels.fetch(result.data.channel_id);
            delete result.data.channel_id;

            // Guild
            result.data.guild = await bot.guilds.fetch(result.data.guild_id);
            delete result.data.guild_id;

            // User
            result.data.member = await result.data.guild.members.fetch(result.data.member.user.id);

            // Remove Type
            delete result.data.type;

            // Callback
            callback(result.data);

        }

        // Complete
        return;

    };

    // Start Module
    require('../functionListener/gateway')(tinyCfg, bot);

    // Complete
    return;

};