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

            // Prepare Values
            if (typeof modID !== "undefined") {
                const _ = require('lodash');
                if (!Array.isArray(modID)) { modID = [modID]; }
                for (const item in modID) {

                    // Prepare Config
                    const permCfg = _.defaultsDeep({}, modID[item], {
                        id: '',
                        type: 1,
                        permission: true
                    });

                    // Insert Config
                    tinyCfg.body.permissions.push(permCfg);

                }
            }

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