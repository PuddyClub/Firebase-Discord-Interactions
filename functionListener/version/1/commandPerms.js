module.exports = (appID, guildID, botToken) => {
    return (commandID, modID) => {
        return new Promise((resolve, reject) => {

            // Config
            const tinyCfg = {
                method: 'POST',
                body: { permissions: [] },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${botToken}`,
                }
            };

            // Body
            tinyCfg.body = JSON.stringify(tinyCfg.body);

            // JSON Fetch
            const JSONfetch = require('@tinypudding/puddy-lib/http/fetch/json');
            JSONfetch(`https://discord.com/api/v8/applications/${appID}/guilds/${guildID}/commands/${commandID}/permissions`, tinyCfg)
                .then(resolve).catch(reject);

            // Complete
            return;

        });
    };
};