// Get Values
const getValues = {

    // Author
    author: function (interaction) {

        // Result
        const result = {};
        if (interaction.member && interaction.member.user) {

            // ID
            result.id = interaction.member.user.id;

            // Username
            result.username = interaction.member.user.username;
            result.discriminator = interaction.member.user.discriminator;
            result.tag = result.username + '#' + result.discriminator;

            // Name
            if (typeof interaction.member.nick === "string") {
                result.nick = interaction.member.nick;
                result.name = interaction.member.nick;
            } else if (typeof interaction.member.user.username === "string") {
                result.name = interaction.member.user.username;
            }

            // Complete
            return result;

        }

        // Nope
        else { return null; }

    },

    // User
    user: function (interaction, where) {

        // Result
        const result = {};

        // Prepare ID
        if (interaction.data.options) {
            result.id = interaction.data.options.find(option => option.name === where && option.type === 6);
            if (result.id) {

                // Get ID
                result.id = result.id.value;

                // Username
                if (interaction.data.resolved && interaction.data.resolved.users[result.id]) {

                    result.username = interaction.data.resolved.users[result.id].username;
                    result.discriminator = interaction.data.resolved.users[result.id].discriminator;
                    result.tag = result.username + '#' + result.discriminator;

                    // Name
                    if (interaction.data.resolved.members[result.id] && typeof interaction.data.resolved.members[result.id].nick === "string") {
                        result.nick = interaction.data.resolved.members[result.id].nick;
                        result.name = interaction.data.resolved.members[result.id].nick;
                    } else {
                        result.name = interaction.data.resolved.users[result.id].username;
                    }

                    // Complete
                    return result;

                }

                // Nope
                else { return null; }

            }

            // Nope
            else { return null; }

        }

        // Nope
        else { return null; }

    },

    // Boolean
    boolean: function (interaction, where) {

        // Prepare Options
        if (interaction.data.options) {
            const result = interaction.data.options.find(option => option.name === where && option.type === 5);
            if (result) {
                if (typeof result.value === "boolean" && result.value) { return true; } else { return false; }
            }

            // Nope
            else { return null; }

        }

        // Nope
        else { return null; }

    },

    // String
    string: function (interaction, where) {

        // Prepare Options
        if (interaction.data.options) {
            const result = interaction.data.options.find(option => option.name === where && option.type === 3);
            if (result) {
                if (typeof result.value === "string") { return result.value; } else { return null; }
            }

            // Nope
            else { return null; }

        }

        // Nope
        else { return null; }

    },

    // String
    integer: function (interaction, where) {

        // Prepare Options
        if (interaction.data.options) {
            const result = interaction.data.options.find(option => option.name === where && option.type === 4);
            if (result) {
                if (typeof result.value === "number") { return result.value; } else { return null; }
            }

            // Nope
            else { return null; }

        }

        // Nope
        else { return null; }

    }

};

module.exports = async function (req, res, logger, di, tinyCfg) {
    try {

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {
                              
            // Warn
            await logger.log(`New command made by ${req.body.client_id}.\nName: ${req.body.data.name}\nAuthor: ${req.body.member.user.username}#${req.body.member.user.discriminator} (${req.body.member.user.id})`);

            // Obj Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Exist Commands
            if (
                objType(tinyCfg.commands, 'object') && objType(req.body.data, 'object') &&
                (typeof req.body.data.name === "string" || typeof req.body.data.name === "number") &&
                (typeof req.body.id === "string" || typeof req.body.id === "number")
            ) {

                // Final Result
                const final_result = { data: req.body, di: di, res: res, get: getValues, cfg: tinyCfg };

                // Normal Callback
                if (!tinyCfg.forceInvalidCommandCallback) {

                    // Get by name
                    if (typeof tinyCfg.commands[req.body.data.name] === "function") {
                        tinyCfg.commands[req.body.data.name](final_result);
                    }

                    // Get by name
                    else if (typeof tinyCfg.commands[req.body.id] === "function") {
                        tinyCfg.commands[req.body.id](final_result);
                    }

                    // Nothing
                    else {
                        tinyCfg.invalidCommandCallback(final_result);
                    }

                }

                // Nope
                else {
                    tinyCfg.invalidCommandCallback(final_result);
                }

            }

            // Nope
            else {
                tinyCfg.errorCallback(req, res, 500, 'The commands could not be loaded!');
            }

        }

        // Ping
        else if (req.body.type === di.InteractionType.PING) {
            await logger.log(`The Bot ID ${req.body.client_id} received a pong.`);
            res.json({ type: di.InteractionResponseType.PONG });
        }

        // Nope
        else {
            await logger.warn(`The Bot ID ${req.body.client_id} made a unknown action.`);
            tinyCfg.errorCallback(req, res, 404, 'Type not found!');
        }

        // Complete
        return;

    } catch (err) {
        await logger.error(err);
        tinyCfg.errorCallback(req, res, 500, 'Server Error!');
        return;
    }
};