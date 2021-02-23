// Get Values
const getValues = {

    // Author
    author: function (interaction) {

        // Result
        const result = {};

        // Is Member
        if (interaction.member && interaction.member.user) {

            // Member
            result.isMember = true;

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

        // Is User
        else if (interaction.user) {

            // Member
            result.isMember = false;

            // ID
            result.id = interaction.user.id;

            // Username
            result.username = interaction.user.username;
            result.discriminator = interaction.user.discriminator;
            result.name = interaction.user.username;
            result.tag = result.username + '#' + result.discriminator;

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

// Message Editor Generator
const messageEditorGenerator = function (interaction, messageID = '@original', version = '/v8') {

    // Get Module
    const interactionResponse = require('../interactionResponse');

    // Prepare Response
    const response = {};

    // Edit Message
    response.edit = interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.id}/${interaction.token}/messages/${messageID}`, {
        method: 'PATCH'
    });

    // Delete Message
    response.delete = interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.id}/${interaction.token}/messages/${messageID}`, {
        method: 'DELETE'
    });

    // Complete
    return response;

};

// Create Message Editor
const createMessageEditor = function (interaction, version = '/v8') {

    // Get Module
    const interactionResponse = require('../interactionResponse');

    // Return
    return function (data) {
        return new Promise(function (resolve, reject) {

            // Result
            interactionResponse(`https://discord.com/api${version}/webhooks/${interaction.id}/${interaction.token}`)(data).then(data => {
                resolve({ data: data, msg: messageEditorGenerator(interaction, data.id) });
                return;
            }).catch(err => {
                reject(err);
                return;
            });

            // Complete
            return;

        });
    };

};

module.exports = async function (req, res, logger, di, tinyCfg) {
    try {

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            // Warn
            if (req.body.member) {
                await logger.log(`New command made by ${req.body.client_id}.\nName: ${req.body.data.name}\nAuthor: ${req.body.member.user.username}#${req.body.member.user.discriminator} (${req.body.member.user.id})`);
            } else if (req.body.user) {
                await logger.log(`New command made by ${req.body.client_id}.\nName: ${req.body.data.name}\nAuthor: ${req.body.user.username}#${req.body.user.discriminator} (${req.body.user.id})`);
            } else {
                await logger.log(`New command made by ${req.body.client_id}.`);
            }

            // Obj Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Exist Commands
            if (
                objType(tinyCfg.commands, 'object') && objType(req.body.data, 'object') &&
                (typeof req.body.data.name === "string" || typeof req.body.data.name === "number") &&
                (typeof req.body.id === "string" || typeof req.body.id === "number")
            ) {

                // Final Result
                const final_result = {

                    // interaction
                    data: req.body,

                    // Discord Interactions Module
                    di: di,

                    // Response
                    res: res,

                    // Get Value Manager
                    get: getValues,

                    // Config
                    cfg: tinyCfg,

                    // Message Editor
                    msg: messageEditorGenerator(req.body),

                    // New Message
                    newMsg: createMessageEditor(req.body)

                };

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