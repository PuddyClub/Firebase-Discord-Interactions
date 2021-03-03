// Get Values
const getValues = {

    types: {
        'sub_command': 1,
        'sub_command_group': 2,
        'string': 3,
        'integer': 4,
        'boolean': 5,
        'user': 6,
        'channel': 7,
        'role': 8
    },

    // Create Functions
    createFunctions: function (interaction, bot) {

        // Result
        const result = {};

        // Get Items
        for (const item in getValues.items) {
            result[item] = getValues.items[item](interaction, bot);
        }

        // Send
        return result;

    },

    // Functions List
    items: {

        // Author
        author: function (interaction) {
            return function () {

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

                    // Complete
                    return result;

                }

                // Nope
                else { return null; }

            };
        },

        // User
        user: function (interaction, bot) {
            return function (where) {
                return new Promise((resolve, reject) => {

                    // Result
                    const result = {};

                    // Prepare ID
                    if (interaction.data.options) {
                        result.id = interaction.data.options.find(option => option.name === where && option.type === 6);
                        if (result.id) {

                            // Get ID
                            result.id = result.id.value;

                            // Final Result data
                            const finalResultData = function () {

                                result.username = interaction.data.resolved.users[result.id].username;
                                result.discriminator = interaction.data.resolved.users[result.id].discriminator;
                                result.tag = result.username + '#' + result.discriminator;

                                // Name
                                if (interaction.data.resolved.members && interaction.data.resolved.members[result.id] && typeof interaction.data.resolved.members[result.id].nick === "string") {
                                    result.nick = interaction.data.resolved.members[result.id].nick;
                                    result.name = interaction.data.resolved.members[result.id].nick;
                                } else {
                                    result.name = interaction.data.resolved.users[result.id].username;
                                }

                                // Complete
                                resolve(result);
                                return;

                            };

                            // Username
                            if (interaction.data.resolved && interaction.data.resolved.users && interaction.data.resolved.users[result.id]) {
                                finalResultData();
                            }

                            // Try Discord Bot
                            else {

                                // Interaction
                                const fixInteractionValues = function (user, member) {

                                    // Fix Values
                                    if (!interaction.data.resolved) { interaction.data.resolved = {}; }
                                    if (!interaction.data.resolved.members) { interaction.data.resolved.members = {}; }
                                    if (!interaction.data.resolved.users) { interaction.data.resolved.users = {}; }
                                    if (!interaction.data.resolved.users[result.id]) { interaction.data.resolved.users[result.id] = {}; }
                                    if (!interaction.data.resolved.members[result.id]) { interaction.data.resolved.members[result.id] = {}; }

                                    // Discord JS Values
                                    interaction.data.resolved.discordjs = member;

                                    // Complete
                                    return;

                                };

                                // Exist Bot
                                if (objType(bot, 'object')) {

                                    // Member User
                                    if (typeof interaction.guild_id === "string" || (typeof interaction.guild_id === "number")) {
                                        bot.guilds.fetch(interaction.guild_id).then(guild => {
                                            guild.members.fetch(result.id).then(member => {
                                                return fixInteractionValues(member.user, member);
                                            });
                                            return;
                                        }).catch(err => {
                                            reject(err);
                                            return;
                                        });
                                    }

                                    // Normal User
                                    else {
                                        bot.users.fetch(result.id).then(user => {
                                            return fixInteractionValues(user);
                                        }).catch(err => {
                                            reject(err);
                                            return;
                                        });
                                    }

                                }

                                // Nope
                                else {
                                    reject(new Error('User Data not found!'));
                                }

                            }

                        }

                        // Nope
                        else { reject(new Error('User ID not found!')); }

                    }

                    // Nope
                    else { reject(new Error('Data Options not found!')); }

                    // Complete
                    return;

                });
            };
        },

        // Boolean
        boolean: function (interaction) {
            return function (where) {

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

            };
        },

        // String
        string: function (interaction) {
            return function (where) {

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

            };
        },

        // String
        integer: function (interaction) {
            return function (where) {

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

            };
        },

        subCommand: function (interaction) {
            return function (where) {

                // Prepare Options
                if (interaction.data.options) {

                    // Look for
                    const result = interaction.data.options.find(option => option.name === where && option.type === 1);

                    // Found
                    if (result) { return true; }

                    // Nope
                    else { return false; }

                }

                // Nope
                else { return null; }

            };
        },

        subCommandGroup: function (interaction, bot) {
            return function (where, subCommand, item) {

                // Prepare Options
                if (interaction.data.options) {

                    // Look for
                    const result = interaction.data.options.find(option => option.name === where && option.type === 2);

                    // Found
                    if (result) {

                        // Look for
                        const nextResult = result.options.find(option => option.name === subCommand && option.type === 1);

                        // Obj Type
                        const objType = require('@tinypudding/puddy-lib/get/objType');

                        // Exist Item
                        if (objType(item, 'object') || Array.isArray(item)) {

                            // Found
                            if (nextResult) {

                                // Get Value
                                const getValue = function (theItem) {

                                    // Validator
                                    if (typeof theItem.type === "string" && typeof theItem.name === "string") {

                                        // Look for
                                        const type = theItem.type.toLowerCase();
                                        const finalResult = result.options.find(option => option.name === theItem.name && option.type === getValues.types[type]);

                                        // Found
                                        if (finalResult) { return getValues.items[type]({ data: { options: [finalResult] } }, bot)(theItem.name); }

                                        // Nope
                                        else { return null; }

                                    }

                                    // Nope
                                    else { return null; }

                                };

                                // Object
                                if (objType(item, 'object')) {
                                    return getValue(item);
                                }

                                // Array
                                else if (Array.isArray(item)) {

                                    // Prepare Final Result
                                    const finalResult = [];

                                    // Get Values
                                    for (const i in item) {

                                        // Object
                                        if (objType(item, 'object')) {
                                            finalResult.push(getValue(item[i]));
                                        }

                                        // Nope
                                        else {
                                            finalResult.push(null);
                                        }

                                    }

                                    // Complete
                                    return finalResult;

                                }

                                // Nothing
                                else { return null; }

                            }

                            // Nope
                            else { return null; }

                        }

                        // Nope
                        else {

                            // Found
                            if (nextResult) { return true; }

                            // Nope
                            else { return false; }

                        }

                    }

                    // Nope
                    else { return null; }

                }

                // Nope
                else { return null; }

            };
        }

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

        // Debug
        if (tinyCfg.debug) { await logger.log('The script V1 is being read...'); }

        // Is Command
        if (req.body.type === di.InteractionType.COMMAND) {

            // Debug
            if (tinyCfg.debug) { await logger.log('The request is a command...'); }

            // Warn
            if (tinyCfg.actionNotifications) {
                if (req.body.member) {
                    await logger.log(`New command made by ${req.body.client_id}.\nName: ${req.body.data.name}\nAuthor: ${req.body.member.user.username}#${req.body.member.user.discriminator} (${req.body.member.user.id})`);
                } else if (req.body.user) {
                    await logger.log(`New command made by ${req.body.client_id}.\nName: ${req.body.data.name}\nAuthor: ${req.body.user.username}#${req.body.user.discriminator} (${req.body.user.id})`);
                } else {
                    await logger.log(`New command made by ${req.body.client_id}.`);
                }
            }

            // Obj Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Exist Commands
            if (
                objType(tinyCfg.commands, 'object') && objType(req.body.data, 'object') &&
                (typeof req.body.data.name === "string" || typeof req.body.data.name === "number") &&
                (typeof req.body.id === "string" || typeof req.body.id === "number") &&
                (typeof req.body.token === "string" || typeof req.body.token === "number")
            ) {

                // Debug
                if (tinyCfg.debug) { await logger.log('The request data was validated...'); }

                // Get Discord Bot Token
                if (
                    objType(tinyCfg.bot, 'object') &&
                    typeof tinyCfg.bot.token !== "string" &&
                    typeof tinyCfg.bot.token !== "number" &&
                    objType(tinyCfg.app, 'object') &&
                    objType(tinyCfg.app[req.query[tinyCfg.varNames.bot]], 'object') &&
                    (typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].bot_token === "string" || typeof tinyCfg.app[req.query[tinyCfg.varNames.bot]].bot_token == "number")
                ) {
                    tinyCfg.bot.token = tinyCfg.app[req.query[tinyCfg.varNames.bot]].bot_token;
                }

                // Final Result
                const final_result = {

                    // interaction
                    data: req.body,

                    // Discord Interactions Module
                    di: di,

                    // Response
                    res: res,

                    // Config
                    cfg: tinyCfg,

                    // Get Value Manager
                    get: getValues.createFunctions(req.body, tinyCfg.bot),

                    // Message Editor
                    msg: messageEditorGenerator(req.body),

                    // New Message
                    newMsg: createMessageEditor(req.body),

                    // Types
                    types: getValues.types,

                    // Reply Message
                    reply: function (msg, type, isNewMessage = false) {

                        // Prepare Result
                        const result = {};

                        // String Message
                        if (typeof msg === "string") {
                            result.data = { tts: false, content: msg };
                        } else if (objType(msg, 'object')) {

                            // Insert Data
                            result.data = msg;

                            // Embed
                            if (objType(result.data.embed, 'object')) {
                                result.data.embeds = [result.data.embed];
                                delete result.data.embed;
                            }

                        }

                        // No Type
                        if (typeof type !== "number") { result.type = di.InteractionResponseType.CHANNEL_MESSAGE; } else {
                            result.type = type;
                        }

                        // Send Result
                        if (!isNewMessage) { return res.json(result); } else {
                            return final_result.newMsg(result);
                        }

                    }

                };

                // Debug
                if (tinyCfg.debug) { await logger.log('The methods of the command script was read...'); }

                // Normal Callback
                if (!tinyCfg.forceInvalidCommandCallback) {

                    // Debug
                    if (tinyCfg.debug) { await logger.log('Reading a command...'); }

                    // Get by name
                    if (typeof tinyCfg.commands[req.body.data.name] === "function") {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Starting the command "' + req.body.data.name + '"...'); }

                        // Result
                        await tinyCfg.commands[req.body.data.name](final_result);

                    }

                    // Get by ID
                    else if (typeof tinyCfg.commands[req.body.id] === "function") {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Starting the command id "' + req.body.id + '"...'); }

                        // Result
                        await tinyCfg.commands[req.body.id](final_result);

                    }

                    // Nothing
                    else {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Invalid Command!'); }

                        // Result
                        await tinyCfg.invalidCommandCallback(final_result);

                    }


                }

                // Nope
                else {

                    // Debug
                    if (tinyCfg.debug) { await logger.log('Invalid Command Forced!'); }

                    // Result
                    await tinyCfg.invalidCommandCallback(final_result);

                }

            }

            // Nope
            else {
                await tinyCfg.errorCallback(req, res, 500, 'The commands could not be loaded!');
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
            await tinyCfg.errorCallback(req, res, 404, 'Type not found!');
        }

        // Complete
        return;

    } catch (err) {
        await logger.error(err);
        await tinyCfg.errorCallback(req, res, 500, 'Server Error!');
        return;
    }
};