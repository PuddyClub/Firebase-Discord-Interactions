// Get Values
const getValues = require('./getValues');

// Message Editor Generator
const messageEditorGenerator = require('./messageEditorGenerator');

// Create Message Editor
const createMessageEditor = require('./createMessageEditor');

// Reply Message
const replyMessage = require('./reply');

module.exports = async function(req, res, logger, di, tinyCfg, followMode = false, awaitMessage = '') {

    // Command Result
    let commandResult;

    // Command Try
    try {

        // Debug
        if (tinyCfg.debug) { await logger.log('The script V1 is being read...'); }

        // Is Command
        if (
            req.body.type === di.InteractionType.APPLICATION_COMMAND ||
            req.body.type === di.InteractionType.MODAL_SUBMIT
        ) {

            // Debug
            if (tinyCfg.debug) { await logger.log('The request is a command!'); }

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

                // Prepare Command Editor
                let setCommandPerm = null;
                if (
                    tinyCfg.bot &&
                    (typeof req.body.client_id === "string" || typeof req.body.client_id === "number") &&
                    (typeof req.body.guild_id === "string" || typeof req.body.guild_id === "number")
                ) {
                    setCommandPerm = require('./commandPerms')(req.body.client_id, req.body.guild_id, tinyCfg.bot.token);
                }

                // Final Result
                const final_result = {

                    // Bot
                    bot: tinyCfg.bot,

                    // Interaction
                    interaction: req.body,

                    // Discord Interactions Module
                    di: di,

                    // Response
                    res: res,

                    // Config
                    cfg: tinyCfg,

                    // Get Value Manager
                    get: getValues.createFunctions(req.body, tinyCfg.bot),

                    // Message Editor
                    msg: messageEditorGenerator(logger, req, res, tinyCfg, req.body),

                    // Set Command Permission
                    setCommandPerm: setCommandPerm,

                    // New Message
                    newMsg: createMessageEditor(logger, req, res, tinyCfg, req.body),

                    // Reply Message
                    reply: replyMessage({}, tinyCfg, logger, req, res),

                    // Pong
                    pong: async() => {
                        if (tinyCfg.debug) { await logger.log(`The message ID ${req.body.id} received a pong.`); }
                        return res.json({ type: di.InteractionResponseType.PONG });
                    },

                    // Types
                    types: getValues.types

                };

                // Await
                if (followMode) {
                    const prepareAwait = replyMessage({ temp: require('../../interactionResponse')(`https://discord.com/api/v8/interactions/${req.body.id}/${req.body.token}/callback`) }, tinyCfg, logger, req, res);
                    await prepareAwait(require('./isHidden')(awaitMessage, req.body, final_result.get, tinyCfg), 'temp');
                }

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
                        commandResult = await tinyCfg.commands[req.body.data.name](final_result);

                    }

                    // Get by ID
                    else if (typeof tinyCfg.commands[req.body.id] === "function") {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Starting the command id "' + req.body.id + '"...'); }

                        // Result
                        commandResult = await tinyCfg.commands[req.body.id](final_result);

                    }

                    // Nothing
                    else {

                        // Debug
                        if (tinyCfg.debug) { await logger.log('Invalid Command!'); }

                        // Result
                        commandResult = await tinyCfg.invalidCommandCallback(final_result);

                    }


                }

                // Nope
                else {

                    // Debug
                    if (tinyCfg.debug) { await logger.log('Invalid Command Forced!'); }

                    // Result
                    commandResult = await tinyCfg.invalidCommandCallback(final_result);

                }

            }

            // Nope
            else {
                commandResult = await tinyCfg.errorCallback(req, res, 500, 'The commands could not be loaded!');
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
            commandResult = await tinyCfg.errorCallback(req, res, 404, 'INVALID INTERACTION TYPE!');
        }

        // Complete
        return commandResult;

    } catch (err) {
        await logger.error(err);
        commandResult = await tinyCfg.errorCallback(req, res, 500, 'Server Error!');
        return commandResult;
    }
};